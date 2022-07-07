import { Injector, Type } from '@angular/core';
import {
  createCustomElement,
  NgElement,
  NgElementConstructor,
  NgElementStrategy,
  NgElementStrategyFactory,
} from '@angular/elements';

/**
 * Function that is used to get {@link NgElementStrategy} from {@link NgElement}
 * used by {@link DefaultNgElementStrategyFactory}
 */
export type NgElementStrategyExtractor = (
  element: NgElement,
) => NgElementStrategy;

/**
 * Options for {@link DefaultNgElementStrategyFactory}
 */
export interface DefaultNgElementStrategyFactoryOptions {
  /**
   * Function that is used to get {@link NgElementStrategy} from {@link NgElement}
   */
  strategyExtractor?: NgElementStrategyExtractor;
}

/**
 * Default options for {@link DefaultNgElementStrategyFactory}
 *
 * By default uses {@link NgElementStrategyExtractor} that is accessing
 * strategy from protected property `NgElement.ngElementStrategy`
 */
export class DefaultNgElementStrategyFactoryOptionsDefault
  implements DefaultNgElementStrategyFactoryOptions
{
  constructor({
    strategyExtractor,
  }: DefaultNgElementStrategyFactoryOptions = {}) {
    if (strategyExtractor) {
      this.strategyExtractor = strategyExtractor;
    }
  }

  /**
   * HACK: Accessing private API of {@link NgElement} in `@angular/elements`
   */
  strategyExtractor(element: NgElement): NgElementStrategy {
    return (element as any).ngElementStrategy;
  }
}

/**
 * Default private {@link NgElementStrategyFactory}
 * used by the `@angular/elements` package
 *
 * The actual  {@link NgElementStrategy} is extracted from dummy
 * custom element using {@link createCustomElement()} from `@angular/elements` package
 * and then using {@link NgElementStrategyExtractor} to get the strategy from it
 */
export class DefaultNgElementStrategyFactory
  implements NgElementStrategyFactory
{
  private static instance = 0;

  private readonly options: DefaultNgElementStrategyFactoryOptionsDefault;
  private readonly elementType: NgElementConstructor<any>;

  constructor(
    component: Type<any>,
    injector: Injector,
    options?: DefaultNgElementStrategyFactoryOptions,
  ) {
    this.options = new DefaultNgElementStrategyFactoryOptionsDefault(options);

    this.elementType = createCustomElement(component, { injector });

    const name = `neb-dummy-${DefaultNgElementStrategyFactory.instance++}`;

    customElements.define(name, this.elementType);
  }

  create(injector: Injector): NgElementStrategy {
    return this.options.strategyExtractor(new this.elementType(injector));
  }
}
