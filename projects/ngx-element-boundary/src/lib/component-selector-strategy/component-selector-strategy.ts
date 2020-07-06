/**
 * Implements a strategy to check if an HTML element is Angular Component
 * to determine if it will act as an "element boundary"
 */
export abstract class ComponentSelectorStrategy {
  abstract isComponent(element: HTMLElement): boolean;
}
