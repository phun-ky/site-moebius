// Handlers are registered with their own parameter types and called with
// whatever the event delivers, so the registries store them loosely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FunctionType = (...args: any[]) => unknown;

export type EventDataAction = FunctionType;

export type TemplateCallback = FunctionType & { onRender?: FunctionType };

export type EventDataId = {
  id: string;
  callback: EventDataAction;
};

export type EventDataSelector = {
  selector: string;
  callback: EventDataAction;
};

export type UseStateValue =
  boolean | string | number | unknown[] | Record<string, unknown>;

export type UseStateReturn = [UseStateValue, FunctionType];

export type StateContext = {
  state: UseStateValue[];
  index: number;
};

/**
 * Represents the event object for an element.
 * @template T - Type of the element used as a target.
 */
export type EventType<T> = Event & {
  target: T & {
    files?: FileList | null;
    id: string;
    parentElement: Element | null;
    value?: string | null;
  };
  offsetX?: number;
  offsetY?: number;
  currentTarget: HTMLElement & {
    documentElement: HTMLElement;
  };
};

/**
 * Represents the mouse event object for an element.
 * @template T - Type of the element used as a target.
 */
export type MouseEventType<T> = MouseEvent & {
  target: T & {
    files?: FileList | null;
    id: string;
    parentElement: Element | null;
    value?: string | null;
  };
  offsetX?: number;
  offsetY?: number;
  currentTarget: HTMLElement & {
    documentElement: HTMLElement;
  };
};

/**
 * Represents the keyboard event object for an element.
 * @template T - Type of the element used as a target.
 */
export type KeyboardEventType<T> = KeyboardEvent & {
  target: T & {
    id: string;
  };
  currentTarget: HTMLElement & {
    documentElement: HTMLElement;
  };
};

export type NavigateToEvent = Event & {
  detail: {
    to: string;
  };
};

export type Route = {
  name: string;
  path?: string;
  page?: string;
  regex?: RegExp;
  layout?: string;
};

export type PreviousRoute = {
  name: string;
};

export type Routes = Route[];

export type RouteDetails = {
  page: RouterMatch;
  previousPage: RouterMatch;
  previousParams: unknown;
  currentParams: unknown;
  paramsChanged: boolean;
  routeChanged: boolean;
};

export type RouterMatch = {
  route: Route;
  result?: RegExpMatchArray | null;
};
