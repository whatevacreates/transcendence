import NotifTypes from "./NotificationTypes.js";

class Notification {
  #id;
  #recipientIds;
  #type;
  #context;
  #payload;
  #createdAt;
  #read;

  constructor({
    id = null,
    recipientIds,
    type,
    context,
    payload,
    read = 0,
    createdAt = null,
  }) {
    this.#id = id;
    this.#recipientIds = recipientIds;
    this.#type = type;
    this.#context = context;
    this.#payload = payload;
    this.#createdAt = createdAt;
    this.#read = read;
  }

  markAsRead() {
    this.#read = 1;
  }

  toJson() {
    return {
      id: this.#id,
      recipientId: this.#recipientIds,
      type: this.#type,
      context: this.#context,
      payload: this.#payload,
      createdAt: this.#createdAt,
      read: this.#read,
    };
  }

  getrecipientIds() {
    return this.#recipientIds;
  }

  getNotifId() {
    return this.#id;
  }

  getType() {
    return this.#type;
  }

  getContext() {
    return this.#context;
  }

  getPayload() {
    return this.#payload;
  }

  getStatus() {
    return this.#read;
  }

  getCreatedAt() {
    return this.#createdAt;
  }

  setId(id) {
    this.#id = id;
  }
}

export default Notification;
