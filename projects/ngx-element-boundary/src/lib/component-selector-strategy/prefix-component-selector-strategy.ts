import { Injectable } from '@angular/core';

import { ComponentSelectorStrategy } from './component-selector-strategy';

/**
 * Options for {@link PrefixComponentSelectorStrategy}
 */
@Injectable()
export abstract class PrefixComponentSelectorStrategyOptions {
  abstract prefix: string;
}

/**
 * Matches HTML Element by the tag name prefix
 *
 * Provide options via DI {@link PrefixComponentSelectorStrategyOptions}
 */
@Injectable()
export class PrefixComponentSelectorStrategy
  implements ComponentSelectorStrategy {
  constructor(private options: PrefixComponentSelectorStrategyOptions) {}

  isComponent(element: HTMLElement): boolean {
    return element.tagName.toLocaleLowerCase().startsWith(this.options.prefix);
  }
}
