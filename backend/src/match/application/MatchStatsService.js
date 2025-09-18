class MatchStatsService {
    #matchRepository;

    constructor(matchRepository) {
        this.#matchRepository = matchRepository;
    }

    async getUserStats(userId) {
        try {
            const matches = await this.#matchRepository.getByUserId(userId);
            if (!matches) {
                console.warn("No matches returned for userId:", userId);
                return {
                    matchesPlayed: 0,
                    matchesWon: 0,
                    matchesLost: 0,
                    winRate: 0,
                    loseRate: 0
                };
            }

            const matchesPlayed = matches.length;
            const matchesWon = matches.filter(m => m.winnerId === userId).length;
            const matchesLost = matchesPlayed - matchesWon;
            const winRate = matchesPlayed > 0 ? (matchesWon / matchesPlayed) * 100 : 0;
            const loseRate = matchesPlayed > 0 ? 100 - winRate : 0;
        
            return {
                matchesPlayed,
                matchesWon,
                matchesLost,
                winRate,
                loseRate
            };
        } catch (error) {
            console.error("Error in getUserStats:", error);
            throw error;
        }
    }
}

export default MatchStatsService;
