import User from "../domain/User.js"; // REVISIT: forbidden: infrastructure cannot import domain class
import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import sanitizer from "../../shared/infrastructure/sanitize/SanitizeHtml.js";
import validate from "../../shared/infrastructure/validation/UserValidator.js";

class UserController {
  #userRepository;
  userApp;
  #logger;
  #hasher;
  #authToken;
  #path;
  #fs;
  #createReadStream;
  #connectionRegistry;
  #friendshipApp;

  constructor(
    userRepository,
    userApp,
    hasher,
    authToken,
    logger,
    connectionRegistry,
    friendshipApp,
  ) {
    this.#userRepository = userRepository;
    this.userApp = userApp;
    this.#hasher = hasher;
    this.#authToken = authToken;
    this.#logger = logger;
    this.#path = path;
    this.#fs = fs;
    this.#createReadStream = createReadStream;
    this.#connectionRegistry = connectionRegistry;
    this.#friendshipApp = friendshipApp;

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.closeAccount = this.closeAccount.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getOnlineUsers = this.getOnlineUsers.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.currentUserVerify = this.currentUserVerify.bind(this);
    this.uploadAvatar = this.uploadAvatar.bind(this);
    this.getAvatar = this.getAvatar.bind(this);
    this.getUsername = this.getUsername.bind(this);
    // this.getUser = this.getUser.bind(this);
  }

  async currentUserVerify(request, response) {
    const tokenPayload = request.user;
    const userId = tokenPayload?.sub || tokenPayload?.id;
    if (!userId) {
      return response.send(null);
    }
    const user = await this.#userRepository.getByUserId(userId);
    if (!user) {
      return response.send(null);
    }

    response.send({
      id: user.getId(),
      username: user.getUsername(),
    });
  }

  async register(request, response) {
    try {
      const { username, password } = request.body;

      const usernameValidation = validate.validateUsername(username);
      const passwordValidation = validate.validatePassword(password);
      if (!usernameValidation.valid || !passwordValidation.valid) {
        return response.code(400).send({
          message: usernameValidation.error || passwordValidation.error
        });
      }

      const newUser = await User.createWithHashedPass(
        username,
        password,
        this.#hasher,
      );

      const newSavedUser = await this.userApp.register(newUser);
      response.send({ message: "Registered successfully", newSavedUser });
    } catch (error) {
      this.#logger.error("Registration failed:", error.message);
      response.code(400).send({ message: "Bad Request" });
    }
  }

  async updateUser(request, response) {
    try {
      const { id } = request.user;
      if (!id)
        return response.code(400).send({ message: "Invalid token payload" });

      const { username, password } = request.body;
      const cleanUsername = sanitizer.sanitize(username);
      const cleanPassword = sanitizer.sanitize(password);
      const updateData = {};
      if (username) updateData.username = cleanUsername;
      if (password) updateData.password = cleanPassword;

      if (Object.keys(updateData).length === 0) {
        return response.code(400).send({ message: "no data to update" });
      }

      const updatedUser = await this.userApp.update(id, updateData, this.#hasher);
      return response.code(200).send({ message: "User updated", user: updatedUser });

    } catch (error) {
      // Known validation or duplication error
      if (error.message.includes("already") || error.message.includes("invalid")) {
        return response.code(400).send({ message: error.message });
      }

      // Unknown error
      console.error("UpdateUser failed:", error);
      return response.code(500).send({ message: "Could not update user" });
    }
  }


  async login(request, response) {
    try {
      const { username, password } = request.body;
      const cleanUsername = sanitizer.sanitize(username);
      const cleanPassword = sanitizer.sanitize(password);
      const existingUser = await this.#userRepository.getByUsername(cleanUsername);
      
      if (!existingUser) throw new Error("Invalid username or password");
      const userId = existingUser.getId();
      
      if (this.#connectionRegistry.isConnected(userId)) {
        return response.code(409).send({ message: "This account is already in use on another browser/device." });
      }
      
      const token = await this.userApp.authenticate(
        cleanUsername,
        cleanPassword,
        this.#authToken,
        this.#hasher,
      );

      if (!token) throw new Error("No token generated");

      response.setCookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/",
        maxAge: 3600,
      });
      response.send({ message: "Logged in successfully" });
    } catch (error) {
      console.error("login failed:", error);
      if (error.message === "Invalid username or password") {
        return response.code(401).send({ message: error.message });
      }
      return response.code(500).send({ message: "Unexpected server error" });
    }
  }

  async logout(request, response) {
    try {
      const { id } = request.user;
      if (!id)
        return response.code(400).send({ message: "Invalid token payload" });
      // Here we could use the User class later on
      const user = await this.#userRepository.getByUserId(id);
      if (!user) return response.code(404).send({ message: "User not found" });

      // await this.userApp.logout(user);
      // make sure the cookie with the user information is no longer available:
      response.clearCookie("token", { path: "/" });
      response.send({ message: "Logged out successfully" });
    } catch (error) {
      // console.error("logout failed:", error);
      response.code(500).send({ message: "Server error during logout" });
    }
  }

  async closeAccount(request, response) {
    try {
      const { id } = request.user;
      if (!id)
        return response.code(400).send({ message: "Invalid token payload" });

      const user = await this.#userRepository.getByUserId(id);
      if (!user) return response.code(404).send({ message: "User not found" });

      await this.userApp.deleteAccount(user);
      response.send({ message: "Account closed successfully" });
    } catch (error) {
      response.code(500).send({ message: "Server error during logout" });
    }
  }

  async getAllUsers(request, response) {
    try {
      const { id } = request.user;
      if (!id)
        return response.code(400).send({ message: "Invalid token payload" });
      const allUsers = await this.#userRepository.getAllUsers();
      const simplified = await Promise.all(
        allUsers.map(async (user) => ({
          id: user.getId(),
          username: user.getUsername(),
          isFriend: await this.#friendshipApp.checkFriendship(id, user.getId()),
        })),
      );

      response.send(simplified);
    } catch (error) {
      // console.error("Failed to fetch users:", error);
      response.code(500).send({ message: "Failed to fetch users" });
    }
  }

  async getOnlineUsers(request, response) {
    try {
      const onlineUserIds = this.#connectionRegistry.getConnectedUsers();
      response.send(onlineUserIds); // e.g. [1, 2, 5]
    } catch (error) {
      // console.error("Failed to fetch online users:", error);
      response.code(500).send({ message: "Failed to fetch online users" });
    }
  }

  async getUsername(request, response) {
    try {
      const { userId } = request.params;
      const user = await this.#userRepository.getByUserId(Number(userId));
      if (!user) return response.code(404).send({ message: "User not found" });
      
      const username = user.getUsername();
      return response.send({ username });
    } catch (error) {
      return response.code(500).send({ message: "Server error fetching username" });
    }
  }

  // async getUser(request, response) {
  //   try {
  //     const userId = parseInt(request.params?.userId, 10);

  //     if (isNaN(userId)) {
  //       return response.code(400).send({ message: "Invalid user Id" });
  //     }

  //     const user = await this.#userRepository.getByUserId(userId);

  //     if (!user) {
  //       console.warn(`getUser: No user found for userId: ${userId}`);
  //       return response.code(404).send({ message: "User not found" });
  //     }
  //     const userSafe = { username: user.getUsername() };
  //     return response.send(userSafe);
  //   } catch (error) {
  //     console.error("getUser: Error fetching user:", error);
  //     return response.code(500).send({ message: "Server error fetching user" });
  //   }
  // }

  async uploadAvatar(request, response) {
    const { id: userId } = request.user;
    if (!userId) {
      return response.code(401).send({ message: "Unauthorized" });
    }

    const data = await request.file();

    try {
      await this.userApp.handleAvatarUpload(userId, data);
      response.send({ message: "Avatar uploaded successfully" });
    } catch (error) {
      // console.error("Avatar upload failed:", error);
      response.code(400).send({ message: "400 Unauthorized" });
    }
  }

  async getAvatar(request, response) {
    const { userId } = request.params;

    // If userId is -1, return robot.png
    if (userId === "-1") {
      const robotPath = this.#path.join(
        process.cwd(),
        "upload",
        "avatar",
        "robot.png",
      );
      return response.type("image/png").send(this.#createReadStream(robotPath));
    }

    const filePath = this.#path.join(
      process.cwd(),
      "upload",
      "avatar",
      `${userId}.png`,
    );

    try {
      await this.#fs.access(filePath);
      return response.type("image/png").send(this.#createReadStream(filePath));
    } catch {
      const fallback = this.#path.join(
        process.cwd(),
        "upload",
        "avatar",
        "default.png",
      );
      return response.type("image/png").send(this.#createReadStream(fallback));
    }
  }
}

export default UserController;

/*
CAreful about sending error messages to the frontend, 
it can be a security breach if a hacker wants to get information about the website
*/
