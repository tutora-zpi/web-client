type EventCallback = (data: unknown) => void;
type UnsubscribeFunction = () => void;

class EventBus {
  private events: Record<string, EventCallback[]> = {};

  constructor() {
    this.events = {};
  }

  subscribe(event: string, callback: EventCallback): UnsubscribeFunction {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback as EventCallback);

    return () => {
      if (!this.events[event]) return;

      const index = this.events[event].indexOf(callback as EventCallback);
      if (index > -1) {
        this.events[event].splice(index, 1);
      }
    };
  }

  publish(event: string, data?: unknown): void {
    if (!this.events[event]) {
      return;
    }

    this.events[event].forEach((callback) => {
      callback(data);
    });
  }

  clear(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

const eventBus = new EventBus();
export default eventBus;
