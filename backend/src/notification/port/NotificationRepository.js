class NotificationRepository {

    save(notification)
    {
      throw new Error('Method not implemented');
    }

    getById(id) {
      throw new Error('Method not implemented');
    }

    getUnreadByrecipientId(recipientId) {
      throw new Error('Method not implemented');
    }

    deleteNotifForMutualInvitation(userAId, userBId) {
      throw new Error('Method not implemented');
    }

    serialize(invitation) {
      throw new Error('Method not implemented');
    }
  
    deserialize(row) {
      throw new Error('Method not implemented');
    }
}

export default NotificationRepository;