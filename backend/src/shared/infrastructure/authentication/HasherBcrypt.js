import bcrypt from "bcrypt";
import Hasher from "../../port/Hasher.js";

class HasherBcrypt extends Hasher {
  #saltRounds;

  constructor(saltRounds = 10) {
    super();
    this.#saltRounds = saltRounds;
  }

  async hash(plaintextPassword) {
    try {
      return await bcrypt.hash(plaintextPassword, this.#saltRounds);
    } catch (error) {
      throw new Error("Error hashing the password");
    }
  }

  async compare(plaintextPassword, hash) {
    try {
      return await bcrypt.compare(plaintextPassword, hash);
    } catch (error) {
      throw new Error("Error comparing passwords");
    }
  }
}

export default HasherBcrypt;