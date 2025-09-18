//entity: all changes should be made through aggregate root `User`
class Profile
{
    #userName;
    #avatar;
    #matchPlayed;
    #wins;
    #abandonedMatches;
    #winningRate;
    #abandonRate;
    //other profile information

    constructor(userName, avatar)
    {
        this.#userName = userName;
        this.#avatar = avatar;
        this.#wins = 0;
        this.#matchPlayed = 0;
        this.#abandonedMatches = 0;
        this.#winningRate = 0;
        this.#abandonRate = 0;
    }

    recordWin()
    {
        this.#matchPlayed++;
        this.#wins++;
        this.#updateStats();
    }

    recordLoss()
    {
        this.#matchPlayed++;
        this.#updateStats();
    }

    recordAbandon()
    {
        this.#matchPlayed++;
        this.#abandonedMatches++;
        this.#updateStats();
    }

    #updateStats()
    {
        this.#winningRate = this.#wins / this.#matchPlayed;
        this.#abandonRate = this.#abandonedMatches / this.#matchPlayed;
    }

    updateAvatar(newAvatar)
    {
        if (newAvatar)
            this.#avatar = newAvatar;
        else
            throw new Error("Invalid avatar");
    }
}

export default Profile;