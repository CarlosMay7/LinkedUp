export interface EventPayload {
  id?: string;
  timestamp?: Date | number;
  [key: string]: any;
}

export interface IEventBus {
  publish<T extends EventPayload>(topic: string, payload: T): Promise<void>;
  subscribe<T extends EventPayload>(
    topic: string,
    handler: (payload: T) => Promise<void>,
  ): void;
}

export const EVENT_BUS = Symbol('EVENT_BUS');
