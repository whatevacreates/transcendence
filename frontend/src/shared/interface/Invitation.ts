interface Invitation {
  id: number;
  recipientIds: number[];
  recipientStatuses: string[];
  createdAt: string;
  type: string;
  senderId: number;
}

export default Invitation;
