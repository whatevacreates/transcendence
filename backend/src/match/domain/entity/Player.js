
class Player {
  #userId = null;
  #isAi = false;
  #alias = null;

  constructor(userId, isAi = false, alias = null) {
    this.#userId = userId;
    this.#isAi = isAi;
    this.#alias = alias;  
  }


	get userId() {
		return this.#userId;
	}

  set alias(alias) {
    this.#alias = alias;
  }

  get alias() {
    return this.#alias;
  }

	isAi() {
		return this.#isAi;
	}
}

export default Player;