//value object
//Centralize notification types into this value object to avoid typos

const NotificationTypes = Object.freeze(
    {
        INVITATION: 'invitation',
        ANNOUNCEMENT: 'announcement',
        ALERT: 'alert',
    }
)

export default NotificationTypes;