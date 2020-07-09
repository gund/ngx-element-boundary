import { Injector } from '@angular/core';
import {
  NgElementStrategy,
  NgElementStrategyEvent,
  NgElementStrategyFactory,
} from '@angular/elements';
import { Observable, of, Subject, ReplaySubject } from 'rxjs';
import { take, takeUntil, timeoutWith, switchAll } from 'rxjs/operators';

import {
  ElementBoundaryNgElementStrategy,
  ElementBoundaryNgElementStrategyFactory,
} from './element-boundary-ng-element-strategy';
import { ElementBoundaryService } from './element-boundary.service';
import { HookableInjector } from './hookable-injector';
import { maybeLateInitStream } from './util';

/**
 * Options for {@link CrossBoundaryNgElementStrategy}
 */
export interface CrossBoundaryNgElementStrategyOptions {
  /**
   * Is it a root component?
   * If `true` - will not try to connect to any boundaries and render immediately
   */
  isRoot?: boolean;
  /**
   * If no boundary found within given time frame - bail and render as-is
   */
  boundaryTimeoutMs?: number;
}

/**
 * Default options for {@link CrossBoundaryNgElementStrategy}
 */
export class CrossBoundaryNgElementStrategyOptionsDefault
  implements CrossBoundaryNgElementStrategyOptions {
  isRoot: boolean;
  boundaryTimeoutMs: number;

  constructor(options: Partial<CrossBoundaryNgElementStrategyOptions> = {}) {
    this.isRoot = options.isRoot ?? false;
    this.boundaryTimeoutMs = options.boundaryTimeoutMs ?? 5000;
  }
}

/**
 * {@link NgElementStrategy} that allows to inherit {@link Injector}'s
 * between Angular Web Components as Angular Components do
 *
 * This is done by defining an "element boundary" on specific HTML Elements
 * in DOM and attaching local {@link Injector} to it and then resolving them
 * from those "element boundaries"
 *
 * It will postpone Angular Component initialization until "element boundary" is found
 * and no other Angular Web Components are located between the closest "element boundary"
 * and the Angular Web Component being initialized
 *
 * The "root" Angular Component will never have "element boundary" so it must be marked
 * as {@link CrossBoundaryNgElementStrategyOptions@isRoot} = `true` to skip waiting
 *
 * If for any reason "element boundary" resolution takes too long - a timeout will be
 * triggered and initialization will proceed without {@link Injector} inheritance
 *
 * By default there is 5 seconds timeout which can be configured by
 * {@link CrossBoundaryNgElementStrategyOptions#boundaryTimeoutMs}
 *
 * To disable the timeout you may set it to `0` (zero, number)
 */
export class CrossBoundaryNgElementStrategy implements NgElementStrategy {
  // HACK: In Angular Elements before v10 `events` property was not set
  // before `this.connect()` was not called resulting in `undefined`
  // so we are using late initialization of stream
  events = maybeLateInitStream(this.baseStrategy, 'events');

  private elementBoundaryService: ElementBoundaryService = this.hookableInjector.get(
    ElementBoundaryService,
  );

  private options = new CrossBoundaryNgElementStrategyOptionsDefault(
    this.incomingOptions,
  );

  private disconnect$ = new Subject<void>();

  constructor(
    private baseStrategy: ElementBoundaryNgElementStrategy,
    private hookableInjector: HookableInjector,
    private incomingOptions?: CrossBoundaryNgElementStrategyOptions,
  ) {}

  connect(element: HTMLElement): void {
    if (this.options.isRoot) {
      return this.doConnect(element);
    }

    this.elementBoundaryService
      .whenBoundaryExist(element)
      .pipe(
        (o$) =>
          this.options.boundaryTimeoutMs > 0
            ? o$.pipe(timeoutWith(this.options.boundaryTimeoutMs, of(null)))
            : o$,
        take(1),
        takeUntil(this.disconnect$),
      )
      .subscribe((boundary) => {
        if (boundary) {
          this.hookableInjector.hook(boundary.injector);
        }

        this.doConnect(element);
      });
  }

  disconnect(): void {
    this.disconnect$.next();
    this.baseStrategy.disconnect();
  }

  getInputValue(propName: string): any {
    return this.baseStrategy.getInputValue(propName);
  }

  setInputValue(propName: string, value: string): void {
    this.baseStrategy.setInputValue(propName, value);
  }

  private doConnect(element: HTMLElement): void {
    this.baseStrategy.connect(element);

    const componentRef = this.baseStrategy.getComponentRef();

    if (!componentRef) {
      return;
    }

    this.elementBoundaryService.addBoundary({
      injector: componentRef.injector,
      element,
      isComponent: true,
    });
  }
}

/**
 * Factory for {@link CrossBoundaryNgElementStrategy}
 */
export class CrossBoundaryNgElementStrategyFactory
  implements NgElementStrategyFactory {
  constructor(
    private baseStrategyFactory: ElementBoundaryNgElementStrategyFactory,
    private options?: CrossBoundaryNgElementStrategyOptions,
  ) {}

  create(injector: Injector): NgElementStrategy {
    const hookableInjector = new HookableInjector(injector);

    return new CrossBoundaryNgElementStrategy(
      this.baseStrategyFactory.create(hookableInjector),
      hookableInjector,
      this.options,
    );
  }
}
