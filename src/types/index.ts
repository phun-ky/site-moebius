/**
 * Represents the event object for an element.
 * @template T - Type of the element used as a target.
 */
export type MoebiusSiteEventType<T> = Event & {
  target: T & {
    files?: FileList | null;
    id: string;
    parentElement: Element | null;
  };
  currentTarget: HTMLElement & {
    documentElement: HTMLElement;
  };
};

/**
 * Represents the keyboard event object for an element.
 * @template T - Type of the element used as a target.
 */
export type MoebiusSiteKeyboardEventType<T> = KeyboardEvent & {
  target: T & {
    id: string;
  };
  currentTarget: HTMLElement & {
    documentElement: HTMLElement;
  };
};

export type MoebiusSiteNavigateToEventType = Event & {
  detail: {
    to: string;
  };
};
