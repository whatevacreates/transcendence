class NotificationApp {
  #notificationRepository;
  #notificationDelivery;

  constructor(notificationRepository, notificationDelivery) {
    this.#notificationRepository = notificationRepository;
    this.#notificationDelivery = notificationDelivery;
  }

  async notify(notification) {
    const notifId = await this.#notificationRepository.save(notification);
    notification.setId(notifId);
    await this.#notificationDelivery.send(notification);
  }
}

export default NotificationApp;
