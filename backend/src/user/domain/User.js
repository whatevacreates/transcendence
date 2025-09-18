import Profile from "./Profile.js";

//DO NOT use the constructor directly to create new user instance. Use `User.createWithHashedPass()` to create valid user instance with password hashed
class User {
  #id;
  #username;
  #password;
  #profile;

  constructor({ id, username, password }) {
    this.#id = id;
    this.#username = username;
    this.#password = password;
    this.#profile = new Profile(this.#username, "path-to-default-avatar");
  }


  resetPassword(newPassword) {
    if (newPassword === this.#password)
      throw new Error("New password shouldn't be the same as current one");
    //add other check of newPassword
    this.#password = newPassword;
  }

  rename(newUsername) {
    if (!newUsername || typeof newUsername !== 'string') {
      throw new Error("Username must be a valid non-empty string.");
    }
  
    if (newUsername === this.#username) {
      throw new Error("New username must be different from the previous one.");
    }
  
    this.#username = newUsername;
  }


  //static factory method:A static method that creates and returns a new object of the same class
  static async createWithHashedPass(username, password, hasher) {
    const hashedPassword = await hasher.hash(password);
    return new User({ username, password: hashedPassword });
  }

  //getters
  getProfile() {
    return this.#profile;
  }

  getId() {
    return this.#id;
  }

  getUsername() {
    return this.#username;
  }

  getPassword() {
    return this.#password;
  }
}

export default User;
