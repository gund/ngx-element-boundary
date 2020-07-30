import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';
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
  private get boundaries$(): BehaviorSubject<ElementBoundary[]> {
    return (
      this.globalRef.global[this.options.propName] ||
      (this.boundaries$ = new BehaviorSubject<ElementBoundary[]>([]))
    );
  }

  private set boundaries$(boundaries: BehaviorSubject<ElementBoundary[]>) {
    this.globalRef.global[this.options.propName] = boundaries;
  }

  constructor(
    private options: GlobalBoundarySharingStrategyOptions,
    private globalRef: GlobalRef,
  ) {}

  getBoundaries(): Observable<ElementBoundary[]> {
    return this.boundaries$.asObservable();
  }

  addBoundary(boundary: ElementBoundary): void {
    const boundaries = this.boundaries$.getValue();

    boundaries.push(boundary);

    this.boundaries$.next(boundaries);
  }

  removeBoundary(boundary: ElementBoundary): void {
    const boundaries = this.boundaries$.getValue();

    const idx = boundaries.indexOf(boundary);

    if (idx === -1) {
      return;
    }

    boundaries.splice(idx, 1);

    this.boundaries$.next(boundaries);
  }
}
