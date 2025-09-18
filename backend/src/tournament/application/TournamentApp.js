// app/TournamentApp.js
import Tournament from '../domain/Tournament.js';
import Player from '../../match/domain/entity/Player.js';
import sanitizer from "../../shared/infrastructure/sanitize/SanitizeHtml.js"; 

class TournamentApp {
    #matchApp;
    #eventEmitter;
    #tournamentBroadcast;
    #tournamentRegistry;
    #matchToTournament = new Map(); // matchId -> tournamentId
    #aliasCheckIntervals = new Map(); // tournamentId -> intervalId

    constructor(matchApp, eventEmitter, tournamentBroadcast, tournamentRegistry) {
        this.#matchApp = matchApp;
        this.#eventEmitter = eventEmitter;
        this.#tournamentBroadcast = tournamentBroadcast;
        this.#tournamentRegistry = tournamentRegistry;
        this.#setupEventListeners();
    }

    #setupEventListeners() {
        this.#eventEmitter.subscribeToInvitation(
            "tournament",
            "accepted",
            (invitationId, senderId, recipientIds) => {
                console.log(`Starting tournament from invitation: ${invitationId}`);
                this.#initializeTournament([senderId, ...recipientIds]);
            }
        );
    }

    #initializeTournament(playerIds) {
        if (playerIds.length != 4) {
            return ;
        }

        const player1 = new Player(playerIds[0]);
        const player2 = new Player(playerIds[1]);
        const player3 = new Player(playerIds[2]);
        const player4 = new Player(playerIds[3]);

        const tournament = new Tournament([player1, player2, player3, player4]);
        this.#tournamentRegistry.add(tournament);
        tournament.phase = 'semi';
        
        // Send match redirect to ALL users simultaneously
        this.#tournamentBroadcast.broadcast(
                tournament.userIds, 
                "match-redirect", 
                tournament.getTournamentData()
        );

        // Immediately send alias request to ALL users
        this.#broadcastAliasRequest(tournament);
        
        // Start alias check with initial immediate check
        this.#startAliasCheckInterval(tournament, 5000, true);
    }

    #startAliasCheckInterval(tournament, interval, immediate = false) {
        const tournamentId = tournament.id;
        if (this.#aliasCheckIntervals.has(tournamentId)) return;

        // Immediate check first
        if (immediate) {
            this.#checkAliases(tournament);
        }

        const intervalId = setInterval(() => {
            this.#checkAliases(tournament);
        }, interval);

        this.#aliasCheckIntervals.set(tournamentId, intervalId);
    }

    #checkAliases(tournament) {
        const playersNeedingAlias = tournament.userIds.filter(userId => {
            const alias = tournament.getAlias(userId);
            return typeof alias !== 'string';
        });

        if (playersNeedingAlias.length > 0) {
            // Resend to ALL missing users simultaneously
            this.#tournamentBroadcast.broadcast(
                playersNeedingAlias, 
                "tournament-alias", 
                null
            );
        } else {
            clearInterval(this.#aliasCheckIntervals.get(tournament.id));
            this.#aliasCheckIntervals.delete(tournament.id);
            this.#startSemiFinal(tournament);
        }
    }

    async #startSemiFinal(tournament) {
        this.#broadcastTournamentState(tournament);

        for (const pair of tournament.getSemiFinalPairs()) {
            const [player1, player2] = pair.map(id => new Player(id));
            await this.#startMatch(tournament, "tournament", player1, player2);
        }
    }

    async #startFinal(tournament) {
        this.#broadcastTournamentState(tournament);

        tournament.phase = 'final';
        const [player1, player2] = tournament.getFinalists().map(id => new Player(id));
        await this.#startMatch(tournament, "tournament", player1, player2);
    }

    async #startMatch(tournament, matchType, player1, player2) {
        const matchId = await this.#matchApp.initAndStartMatch(
            matchType,
            player1.userId,
            player2.userId
        );
        
        const handler = this.#createMatchHandler();
        const unsubscribe = this.#eventEmitter.subscribeToMatchOver(matchId, handler);
        tournament.matchSubscriptions.set(matchId, unsubscribe);

        if (tournament.phase === 'semi') {
            tournament.semiFinalMatches.add(matchId);
        } else {
            tournament.finalMatchId = matchId;
        }
        
        this.#matchToTournament.set(matchId, tournament.id);
    }

    #createMatchHandler() {
        return (matchId, winnerId, loserId, userIds, score) => {
            const tournamentId = this.#matchToTournament.get(matchId);
            if (!tournamentId) return;
            
            const tournament = this.#tournamentRegistry.getById(tournamentId);
            if (!tournament) return;

            const [scoreWinner, scoreLoser] = winnerId === userIds[0] 
                ? [score[0], score[1]] 
                : [score[1], score[0]];
            
            this.#recordResult(tournament, winnerId, loserId, scoreWinner, scoreLoser);
            this.#broadcastTournamentState(tournament);
            this.#handleMatchCompletion(tournament, matchId);
        };
    }

    #recordResult(tournament, winnerId, loserId, scoreWinner, scoreLoser) {
        if (tournament.phase === 'semi') {
            tournament.recordSemiFinalResult(winnerId, loserId, scoreWinner, scoreLoser);
        } else {
            tournament.recordFinalResult(winnerId, loserId, scoreWinner, scoreLoser);
        }
    }

    #broadcastTournamentState(tournament) {
        this.#tournamentBroadcast.broadcast(
            tournament.userIds, 
            "tournament-update", 
            tournament.getTournamentData()
        );
    }

    #broadcastAliasRequest(tournament) {
        this.#tournamentBroadcast.broadcast(
            tournament.userIds,
            "tournament-alias",
            null
        );
    }

    registerAlias(userId, alias) {
        const cleanAlias = sanitizer.sanitize(alias);

        const tournament = this.#tournamentRegistry.getByPlayer(userId);
        if (tournament) {
            tournament.registerAlias(userId, cleanAlias);
        }
    }

    getAlias(userId) {
        const tournament = this.#tournamentRegistry.getByPlayer(userId);
        if (!tournament) {
            throw new Error(`Tournament not found for userId: ${userId}`);
        }
        return tournament.getAlias(userId);
    }

    #handleMatchCompletion(tournament, matchId) {
        this.#cleanupMatch(tournament, matchId);
        
       // Add this check for semi-final completion
        if (tournament.phase === 'semi' && tournament.semiFinalMatches.size === 0) {
            this.#startFinal(tournament);
        } 
        // Add this else if for final completion
        else if (tournament.phase === 'final' && matchId === tournament.finalMatchId) {
            this.#finalizeTournament(tournament);
        }
    }

    #cleanupMatch(tournament, matchId) {
        const unsubscribe = tournament.matchSubscriptions.get(matchId);
        if (unsubscribe) {
            unsubscribe();
            tournament.matchSubscriptions.delete(matchId);
        }

        if (tournament.phase === 'semi') {
            tournament.semiFinalMatches.delete(matchId);
        } else if (matchId === tournament.finalMatchId) {
            tournament.finalMatchId = null;
        }
        
        this.#matchToTournament.delete(matchId);
    }

    #finalizeTournament(tournament) {
        console.log("Tournament completed. Final ranking:", tournament.getTournamentData());
        tournament.resetAliases();
        this.#tournamentRegistry.remove(tournament);
    }
}

export default TournamentApp;