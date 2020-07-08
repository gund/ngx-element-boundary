import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { scan, shareReplay } from 'rxjs/operators';

import { ElementBoundary } from '../types';
import { BoundarySharingStrategy } from './boundary-sharing-strategy';

/**
 * Shares boundaries withing single Angular Application
 */
@Injectable({ providedIn: 'root' })
export class SingleAppBoundarySharingStrategy
  implements BoundarySharingStrategy {
  private readonly addBoundary$ = new Subject<ElementBoundary>();

  private readonly boundaries$ = this.addBoundary$.pipe(
    scan((acc, boundary) => [...acc, boundary], [] as ElementBoundary[]),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  getBoundaries(): Observable<ElementBoundary[]> {
    return this.boundaries$;
  }

  addBoundary(boundary: ElementBoundary): void {
    this.addBoundary$.next(boundary);
  }
}
