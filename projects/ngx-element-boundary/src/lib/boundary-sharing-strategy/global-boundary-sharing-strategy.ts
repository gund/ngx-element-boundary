import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { scan, shareReplay } from 'rxjs/operators';

import { ElementBoundary } from '../types';
import { BoundarySharingStrategy } from './boundary-sharing-strategy';

/**
 * Browser {@link Window} DI factory for {@link GlobalRef}
 */
export function windowGlobalRefFactory(): GlobalRef {
  return { global: window as any };
}

/**
 * A reference to global object
 */
@Injectable({ providedIn: 'root', useFactory: windowGlobalRefFactory })
export abstract class GlobalRef {
  abstract global: Record<string, any>;
}

/**
 * Options for {@link GlobalBoundarySharingStrategy}
 */
@Injectable({ providedIn: 'root' })
export class GlobalBoundarySharingStrategyOptions {
  /** Property used to share data on {@link GlobalRef} object */
  propName = '__neb-boundary-data';
}

/**
 * Shares boundaries on global {@link GlobalRef} object
 * across any number of Angular Applications
 *
 * Provide options via DI {@link GlobalBoundarySharingStrategyOptions}
 */
@Injectable({ providedIn: 'root' })
export class GlobalBoundarySharingStrategy implements BoundarySharingStrategy {
  private readonly addBoundary$ = this._boundary$;

  private readonly boundaries$ = this.addBoundary$.pipe(
    scan((acc, boundary) => [...acc, boundary], [] as ElementBoundary[]),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  private get _boundary$(): ReplaySubject<ElementBoundary> {
    return (
      this.globalRef.global[this.options.propName] ||
      (this._boundary$ = new ReplaySubject(1))
    );
  }

  private set _boundary$(boundaries: ReplaySubject<ElementBoundary>) {
    this.globalRef.global[this.options.propName] = boundaries;
  }

  constructor(
    private options: GlobalBoundarySharingStrategyOptions,
    private globalRef: GlobalRef,
  ) {}

  getBoundaries(): Observable<ElementBoundary[]> {
    return this.boundaries$;
  }

  addBoundary(boundary: ElementBoundary): void {
    this.addBoundary$.next(boundary);
  }
}
