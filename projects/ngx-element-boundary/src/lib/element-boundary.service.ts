import { Injectable, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';

import { BoundarySharingStrategy } from './boundary-sharing-strategy/boundary-sharing-strategy';
import { ComponentSelectorStrategy } from './component-selector-strategy/component-selector-strategy';
import { ElementBoundary } from './types';
import { isDefined } from './util';

/**
 * Service that allows to register "element boundaries" and
 * wait until appropriate boundary found for given HTML Element
 */
@Injectable({ providedIn: 'root' })
export class ElementBoundaryService {
  private boundaries$ = this.boundarySharingStrategy.getBoundaries().pipe(
    map((boundaries) =>
      boundaries.sort((b1, b2) => this.sortBoundariesByDepth(b1, b2)),
    ),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  constructor(
    private boundarySharingStrategy: BoundarySharingStrategy,
    @Optional() private componentSelectorStrategy?: ComponentSelectorStrategy,
  ) {}

  /**
   * Register "element boundary"
   */
  addBoundary(boundary: ElementBoundary): void {
    this.boundarySharingStrategy.addBoundary(boundary);
  }

  /**
   * Wait until appropriate "element boundary" exists for HTML Element
   */
  whenBoundaryExist(
    element: HTMLElement,
    timeoutMs: number,
  ): Observable<ElementBoundary | null> {
    return this.boundaries$.pipe(
      map((boundaries) =>
        boundaries.find(
          (boundary) =>
            boundary.element.contains(element) &&
            !this.hasComponentsBetween(boundary.element, element),
        ),
      ),
      filter(isDefined),
      (o$) => (timeoutMs > 0 ? o$.pipe(timeoutWith(timeoutMs, of(null))) : o$),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  private sortBoundariesByDepth(
    b1: ElementBoundary,
    b2: ElementBoundary,
  ): number {
    return b1.element.contains(b2.element) ? 1 : -1;
  }

  private hasComponentsBetween(
    parent: HTMLElement,
    child: HTMLElement,
  ): boolean {
    if (!this.componentSelectorStrategy) {
      return false;
    }

    let element: HTMLElement | null = child;

    // tslint:disable-next-line: no-conditional-assignment
    while ((element = element.parentElement) && element !== parent) {
      if (this.componentSelectorStrategy.isComponent(element)) {
        return true;
      }
    }

    return false;
  }
}
