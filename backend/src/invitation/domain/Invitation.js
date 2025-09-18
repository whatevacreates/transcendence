class Invitation {
  #id;
  #senderId;
  #recipientIds = [];
  #type;
  #allowedTypes = ["match", "tournament", "friendship"];
  #createdAt;
  #timeoutInMs = 2 * 60 * 1000; // Default timeout 2 minutes

  constructor(id = null, senderId, recipientIds, type, createdAt = null) {
    if (!Array.isArray(recipientIds)) {
      throw new Error("recipientIds must be an array");
    }

    if (recipientIds.includes(senderId)) {
      throw new Error("senderId cannot be a recipient");
    }

    if (!this.#allowedTypes.includes(type)) {
      throw new Error(
        `The type '${type}' is not allowed. It can only be : ${this.#allowedTypes.join(
          ", ",
        )}`,
      );
    }

    this.#id = id;
    this.#senderId = senderId;
    this.#recipientIds = recipientIds;
    this.#type = type;
    this.#createdAt = createdAt;
  }

  get id() {
    return this.#id;
  }

  get senderId() {
    return this.#senderId;
  }

  get recipientIds() {
    return this.#recipientIds;
  }

  get recipientCount() {
	return this.#recipientIds.length;
  }

  get type() {
    return this.#type;
  }

  get createdAt() {
    return this.#createdAt;
  }

  setId(id) {
    this.#id = id;
  }

  hasExpired() {
    return Date.now() - this.#createdAt > this.#timeoutInMs;
  }
}

export default Invitation;
