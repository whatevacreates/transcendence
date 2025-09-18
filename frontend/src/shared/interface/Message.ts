interface Message {
    content: string;
    user: string;
    time: string;
    type: 'sent' | 'received';
  }

export default Message;