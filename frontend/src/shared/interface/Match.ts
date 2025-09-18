interface Match {
    matchId: string;
    timestamp: number;
    userIdA: number;
    userIdB: number;
    userAUsername: string;
    userBUsername: string;
    winnerId: number;
    scoreA: number;
    scoreB: number;
};

export default Match;