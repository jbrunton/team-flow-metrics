import EventEmitter from "events";

class EventBus extends EventEmitter {}

export const bus = new EventBus();

export enum Event {
  BROADCAST = "BROADCAST",
}
