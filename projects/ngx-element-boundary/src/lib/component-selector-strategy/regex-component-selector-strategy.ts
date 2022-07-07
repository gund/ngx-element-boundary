import { Injectable } from '@angular/core';

import { ComponentSelectorStrategy } from './component-selector-strategy';

/**
 * Options for {@link RegexComponentSelectorStrategy}
 */
@Injectable()
export abstract class RegexComponentSelectorStrategyOptions {
  abstract regex: RegExp;
}

/**
 * Matches HTML Element by the tag name {@link RegExp}
 *
 * Provide options via DI {@link PrefixComponentSelectorStrategyOptions}
 */
@Injectable()
export class RegexComponentSelectorStrategy
  implements ComponentSelectorStrategy
{
  constructor(private options: RegexComponentSelectorStrategyOptions) {}

  isComponent(element: HTMLElement): boolean {
    return this.options.regex.test(element.tagName);
  }
}
