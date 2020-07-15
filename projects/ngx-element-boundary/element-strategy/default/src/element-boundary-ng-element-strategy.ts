import { ComponentRef, Injector, Type } from '@angular/core';
import { NgElementStrategy, NgElementStrategyFactory } from '@angular/elements';
import {
  ElementBoundaryNgElementStrategy,
  ElementBoundaryNgElementStrategyFactory,
  maybeLateInitStream,
} from 'ngx-element-boundary';

import {
  DefaultNgElementStrategyFactory,
  DefaultNgElementStrategyFactoryOptions,
} from './default-ng-element-strategy';

/**
 * Function that extracts {@link ComponentRef} from the {@link NgElementStrategy}
 * used by {@link DefaultElementBoundaryNgElementStrategy}
 */
export type NgElementStrategyComponentRefExtractor = (
  strategy: NgElementStrategy,
) => ComponentRef<any> | undefined;

/**
 * Options for {@link DefaultElementBoundaryNgElementStrategy}
 */
export interface DefaultElementBoundaryNgElementStrategyOptions {
  /**
   * Function that extracts {@link ComponentRef} from the default {@link NgElementStrategy}
   */
  componentRefExtractor?: NgElementStrategyComponentRefExtractor;
}

/**
 * Default options for {@link DefaultElementBoundaryNgElementStrategy}
 *
 * By default extracts {@link ComponentRef} from
 * protected private `ComponentNgElementStrategy.componentRef`
 */
export class DefaultElementBoundaryNgElementStrategyOptionsDefault
  implements DefaultElementBoundaryNgElementStrategyOptions {
  constructor({
    componentRefExtractor,
  }: DefaultElementBoundaryNgElementStrategyOptions = {}) {
    if (componentRefExtractor) {
      this.componentRefExtractor = componentRefExtractor;
    }
  }

  /**
   * HACK: Accessing private API of {@link ComponentNgElementStrategy} in `@angular/elements`
   */
  componentRefExtractor(strategy: NgElementStrategy) {
    return (strategy as any).componentRef;
  }
}

/**
 * Converts default {@link NgElementStrategy} into {@link ElementBoundaryNgElementStrategy}
 * by using {@link NgElementStrategyComponentRefExtractor} to extract {@link ComponentRef}
 * from default {@link NgElementStrategy} of `@angular/elements` package
 */
export class DefaultElementBoundaryNgElementStrategy
  implements ElementBoundaryNgElementStrategy {
  // HACK: In Angular Elements before v10 `events` property was not set
  // before `this.connect()` was not called resulting in `undefined`
  // so we are using late initialization of stream
  events = maybeLateInitStream(this.defaultStrategy, 'events');

  private options: DefaultElementBoundaryNgElementStrategyOptionsDefault;

  constructor(
    private defaultStrategy: NgElementStrategy,
    options?: DefaultElementBoundaryNgElementStrategyOptions,
  ) {
    this.options = new DefaultElementBoundaryNgElementStrategyOptionsDefault(
      options,
    );
  }

  getComponentRef(): ComponentRef<any> | undefined {
    return this.options.componentRefExtractor(this.defaultStrategy);
  }

  connect(element: HTMLElement): void {
    this.defaultStrategy.connect(element);
  }

  disconnect(): void {
    this.defaultStrategy.disconnect();
  }

  getInputValue(propName: string): any {
    return this.defaultStrategy.getInputValue(propName);
  }

  setInputValue(propName: string, value: string): void {
    this.defaultStrategy.setInputValue(propName, value);
  }
}

/**
 * Strategy to create the default {@link NgElementStrategyFactory}
 * from `@angular/elements` package
 * that is used by {@link DefaultElementBoundaryNgElementStrategyFactory}
 *
 * Allows to capture options type `O`
 */
export interface DefaultNgElementStrategyFactoryStrategy<O = never> {
  create(
    component: Type<any>,
    injector: Injector,
    options?: O,
  ): NgElementStrategyFactory;
}

/**
 * Extract options type `O` from the {@link DefaultNgElementStrategyFactoryStrategy}
 */
export type DefaultNgElementStrategyFactoryStrategyOptions<
  S
> = S extends DefaultNgElementStrategyFactoryStrategy<infer O> ? O : never;

/**
 * Options for {@link DefaultElementBoundaryNgElementStrategyFactory}
 */
export interface DefaultElementBoundaryNgElementStrategyFactoryOptions<
  S extends DefaultNgElementStrategyFactoryStrategy<any>
> {
  /**
   * Strategy to create the default {@link NgElementStrategyFactory}
   * from `@angular/elements` package
   */
  factoryStrategy?: S;
  /**
   * Options for the `factoryStrategy`
   */
  factoryStrategyOptions?: DefaultNgElementStrategyFactoryStrategyOptions<S>;
  /**
   * Options for {@link DefaultElementBoundaryNgElementStrategy}
   */
  strategyOptions?: DefaultElementBoundaryNgElementStrategyOptions;
}

/**
 * Default strategy for {@link DefaultNgElementStrategyFactoryStrategy}
 * that uses {@link DefaultNgElementStrategyFactory}
 * to extract {@link NgElementStrategyFactory}
 *
 * Allows to provide options {@link DefaultNgElementStrategyFactoryOptions}
 */
export class DefaultNgElementStrategyFactoryStrategyDefault
  implements
    DefaultNgElementStrategyFactoryStrategy<
      DefaultNgElementStrategyFactoryOptions
    > {
  create(
    component: Type<any>,
    injector: Injector,
    options?: DefaultNgElementStrategyFactoryOptions,
  ): NgElementStrategyFactory {
    return new DefaultNgElementStrategyFactory(component, injector, options);
  }
}

/**
 * Default options for {@link DefaultElementBoundaryNgElementStrategyFactory}
 *
 * By default uses {@link DefaultNgElementStrategyFactoryStrategyDefault}
 * as a {@link DefaultNgElementStrategyFactoryStrategy}
 */
export class DefaultElementBoundaryNgElementStrategyFactoryOptionsDefault<
  S extends DefaultNgElementStrategyFactoryStrategy<
    any
  > = DefaultNgElementStrategyFactoryStrategyDefault
> implements DefaultElementBoundaryNgElementStrategyFactoryOptions<S> {
  factoryStrategy: S;
  factoryStrategyOptions?: DefaultNgElementStrategyFactoryStrategyOptions<S>;
  strategyOptions?: DefaultElementBoundaryNgElementStrategyOptions;

  constructor({
    factoryStrategy,
    factoryStrategyOptions: factoryOptions,
    strategyOptions,
  }: DefaultElementBoundaryNgElementStrategyFactoryOptions<S> = {}) {
    this.factoryStrategy =
      factoryStrategy ??
      (new DefaultNgElementStrategyFactoryStrategyDefault() as S);
    this.factoryStrategyOptions = factoryOptions;
    this.strategyOptions = strategyOptions;
  }
}

/**
 * Implements {@link ElementBoundaryNgElementStrategyFactory} that takes
 * default {@link NgElementStrategyFactory} from `@angular/elements` package
 * and transforms it into {@link ElementBoundaryNgElementStrategy}
 * by using {@link DefaultNgElementStrategyFactoryStrategy}
 *
 * By default uses {@link DefaultNgElementStrategyFactoryStrategyDefault}
 * as a {@link DefaultNgElementStrategyFactoryStrategy}
 */
export class DefaultElementBoundaryNgElementStrategyFactory<
  S extends DefaultNgElementStrategyFactoryStrategy<
    any
  > = DefaultNgElementStrategyFactoryStrategyDefault
> implements ElementBoundaryNgElementStrategyFactory {
  private options: DefaultElementBoundaryNgElementStrategyFactoryOptionsDefault<
    S
  >;
  private defaultStrategyFactory: NgElementStrategyFactory;

  constructor(
    component: Type<any>,
    injector: Injector,
    options?: DefaultElementBoundaryNgElementStrategyFactoryOptions<S>,
  ) {
    this.options = new DefaultElementBoundaryNgElementStrategyFactoryOptionsDefault(
      options,
    );

    this.defaultStrategyFactory = this.options.factoryStrategy.create(
      component,
      injector,
      this.options.factoryStrategyOptions,
    );
  }

  create(injector: Injector): ElementBoundaryNgElementStrategy {
    return new DefaultElementBoundaryNgElementStrategy(
      this.defaultStrategyFactory.create(injector),
      this.options.strategyOptions,
    );
  }
}
