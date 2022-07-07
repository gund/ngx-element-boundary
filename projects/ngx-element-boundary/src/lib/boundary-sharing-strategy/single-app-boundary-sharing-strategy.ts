import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ElementBoundary } from '../types';
import { BoundarySharingStrategy } from './boundary-sharing-strategy';

/**
 * Shares boundaries withing single Angular Application
 */
@Injectable({ providedIn: 'root' })
export class SingleAppBoundarySharingStrategy
  implements BoundarySharingStrategy
{
  private readonly boundaries$ = new BehaviorSubject<ElementBoundary[]>([]);

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
