//value object
//Centralize notification types into this value object to avoid typos

const NotificationContexts = Object.freeze(
    {
        FRIENDSHIP: 'friendship',
        MATCH: 'match',
        TOURNAMENT: 'tournament',
    }
)

export default NotificationContexts;