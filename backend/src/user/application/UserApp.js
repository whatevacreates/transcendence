// Application Layer of User context provides user-related services such by coordinating domain behavior and interacting with the UserRepository. It serves as a bridge between domain model and the outside world
import AvatarUploadService from './AvatarUploadService.js';
import validate from '../../shared/infrastructure/validation/UserValidator.js';

class UserApp {
  #userRepository;
  #hasher;
  #authToken;

  constructor(userRepositorysitory, hasher, authToken) {
    this.#userRepository = userRepositorysitory;
    this.#hasher = hasher;
    this.#authToken = authToken;
  }

  //newUser already has the hashed password
  async register(newUser) {
    return await this.#userRepository.save(newUser);
  }

  // check auth for user
  async authenticate(username, password, authTokenGenerator, passwordHasher) {
    console.log("userApp.authenticate: username : ", username);
    const existingUser = await this.#userRepository.getByUsername(username);
    console.log(
      "userApp.authenticate: existingUser : ",
      existingUser.getUsername(),
    );
    if (!existingUser) throw new Error("Invalid username or password");

    const passwordsMatch = await passwordHasher.compare(
      password,
      existingUser.getPassword(),
    );

    if (!passwordsMatch) {
      throw new Error("Invalid username or password");
    }

    //existingUser.login();
    //await this.#userRepository.save(existingUser);
    const token = authTokenGenerator.generate({
      id: existingUser.getId(),
      username,
    });
    return token;
  }

  // // Update user also uses the save function
  async update(userId, { username, password }, passwordHasher) {
    const user = await this.#userRepository.getByUserId(userId);
    if (!user) 
      throw new Error("User not found");

    if (username) {
      const validation = validate.validateUsername(username);
      if (!validation.valid) 
        throw new Error(validation.error);
    
      const existing = await this.#userRepository.getByUsername(username);
      if (existing && existing.id !== userId) {
        throw new Error("Username is already taken");
      }

      user.rename(username);
    }

    if (password) {
      const validation = validate.validatePassword(password);
      if (!validation.valid) 
        throw new Error(validation.error);
      const hashedPassword = await passwordHasher.hash(password);
      user.resetPassword(hashedPassword);
    }
    return await this.#userRepository.save(user);
  }

  // logout logic
  // async logout(user) {
    // const savedUser = await this.#userRepository.save(user);
    // return savedUser;
  // }

  async changePassword(user, newPassword) {
    user.resetPassword(newPassword);
    const savedUser = await this.#userRepository.save(user);
    return savedUser;
  }

  async updateAvatar(user, newAvatar) {
    user.getProfile().updateAvatar(newAvatar);
    const savedUser = await this.#userRepository.save(user);
    return savedUser;
  }

  // async deleteAccount(user) {
  //   user.deleteAccount();
  //   const res = await this.#userRepository.deleteUser(user);
  //   return res;
  // }

    async handleAvatarUpload(userId, file) {
        await AvatarUploadService.save(file, userId);

        const user = await this.#userRepository.getByUserId(userId);
        if (!user) throw new Error("User not found");

        await this.#userRepository.save(user);
        return { message: "Avatar uploaded successfully" };
    }

}

export default UserApp;
