/*
 * EventEmitter provides a simple mechanism for subscribing to and emitting events.
 * - Listeners (which are functions) can subscribe to specific event types via `subscribe()`.
 * - When an event is emitted (via `emit()`), all subscribed listeners (functions) for that event type are called.
 * - Any additional arguments passed `emit()` are forwarded to the listener functions.
 * - By default, listeners are removed after the event is emitted, so they are only called once.
 */

class EventEmitter {
  #listeners = new Map();

  emit(eventType, removeAfterPublish = true, ...args) {
    console.log(
      `EventEmitter: emit: event ${eventType} removeAfterPublish: ${removeAfterPublish} args: ${args}`,
    );
    const listeners = this.#listeners.get(eventType) || [];
    //test
    console.log("getting listeners to trigger: ", listeners);
    console.log("args passed to listeners: ", ...args);
    //
    listeners.forEach((listener) => listener(...args));
    if (removeAfterPublish) {
      this.#listeners.delete(eventType);
    }
  }

  subscribe(eventType, listener) {
    console.log(
      `EventEmitter: subscribe: EventEmitter: ${eventType} listener: ${listener}`,
    );
    if (!this.#listeners.has(eventType)) {
      this.#listeners.set(eventType, []);
    }
    this.#listeners.get(eventType).push(listener);
  }

  // --- Match Events ---
  emitMatchOver(matchId, winnerId, loserId, userIds, score) {
    console.log(
      `emitMatchOver: matchId: ${matchId} winnerId: ${winnerId} loserId: ${loserId} score: ${score}`,
    );
    this.emit(`matchOver:${matchId}`, true, matchId, winnerId, loserId, userIds, score);
  }

  subscribeToMatchOver(matchId, listener) {
    console.log(
      `subscribeToMatchOver: matchId: ${matchId} listener: ${
        listener.name || "anonymous"
      }`,
    );
    this.subscribe(`matchOver:${matchId}`, listener);
  }

  // --- Invitation Events ---
  emitInvitationEvent(event, invitation) {
    const eventName = `${invitation.type}Invitation${event}`;
    //test
    console.log(`event name: ${eventName}`);
    console.log("listener args: ", {
      invitationId: invitation.id,
      senderId: invitation.senderId,
      recipientIds: invitation.recipientIds,
    });
    //let recipientIdInfo;
    //if (invitation.type === "friendship")
      //recipientIdInfo = invitation.recipientIds[0];
    //else recipientIdInfo = invitation.recipientIds;
    //
    this.emit(
      eventName,
      false,
      invitation.id,
      invitation.senderId,
      invitation.recipientIds,
    );
  }

  subscribeToInvitation(type, event, listener) {
    const eventName = `${type}Invitation${event}`;
    console.log(
      `subscribeToInvitation: ${eventName} listener: ${
        listener.name || "anonymous"
      }`,
    );
    this.subscribe(eventName, listener);
  }
}

export default EventEmitter;
