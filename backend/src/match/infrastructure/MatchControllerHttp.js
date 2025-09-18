export default class MatchControllerHttp {
    constructor(matchApp, matchRepository, userRepository, matchStatsService, pongConfig) {
        this.matchApp = matchApp;
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
        this.matchStatsService = matchStatsService;
        this.pongConfig = pongConfig;
    }

    async getConfig(request, response) {
        return response.send(this.pongConfig);
    }

    async getAllMatches(request, response) {
        const matches = await this.matchRepository.getAll();
        return response.send(matches);
    }

    async getUserStats(request, response) {
        const userId = parseInt(request.params.userId, 10);
        const stats = await this.matchStatsService.getUserStats(userId);
        return response.send(stats);
    }

    async getMatchHistory(request, response) {
        const userId = parseInt(request.params.userId, 10);
        const matches = await this.matchRepository.getByUserId(userId);

        const history = await Promise.all(
            matches.map(async match => {
                const userA = await this.userRepository.getByUserId(match.userIdA);
                const userB = await this.userRepository.getByUserId(match.userIdB);
                return {
                    ...match,
                    winnerId: match.winnerId !== null ? match.winnerId : null,
                    userAUsername: userA?.getUsername() ?? null,
                    userBUsername: userB?.getUsername() ?? null,
                };
            })
        );

        return response.send(history);
    }

    async getMatchState(request, response) {
        const matchId = request.params.id;
        const match = this.matchRepository.get(matchId);
        if (!match || typeof match.getSerializableState !== 'function') {
            return response.status(404).send({ error: 'Match not found' });
        }
        return response.send(match.getSerializableState());
    }

    async startMatch(request, response) {
        const { matchType, userIdA, userIdB } = request.body;
        const matchId = await this.matchApp.initAndStartMatch(matchType, userIdA, userIdB);
        return response.code(201).send({ matchId });
    }

    async controlMatch(request, response) {
        const matchId = request.params.id;
        const { userId, control, paddleIndex } = request.body;

        const controlMap = {
            'move-paddle-up': this.matchApp.movePaddleUp,
            'move-paddle-down': this.matchApp.movePaddleDown,
            'move-paddle-stop': this.matchApp.movePaddleStop
        };

        const handler = controlMap[control];
        if (!handler) {
            return response.status(400).send({ error: 'Invalid control command' });
        }

        await handler.call(this.matchApp, matchId, userId, paddleIndex);
        return response.code(202).send();
    }
}
