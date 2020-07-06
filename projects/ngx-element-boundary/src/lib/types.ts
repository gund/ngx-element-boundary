import { Injector } from '@angular/core';

/**
 * Represents "element boundary" with attached {@link Injector}
 */
export interface ElementBoundary {
  injector: Injector;
  element: HTMLElement;
  isComponent: boolean;
}
