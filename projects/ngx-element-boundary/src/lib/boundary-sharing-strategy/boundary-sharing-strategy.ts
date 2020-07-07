import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ElementBoundary } from '../types';
import { SingleAppBoundarySharingStrategy } from './single-app-boundary-sharing-strategy';

/**
 * Implements a strategy to share data for {@link ElementBoundaryService}
 * across multiple different Angular Components that may
 * potentially be coming from different bundles
 *
 * Uses {@link SingleAppBoundarySharingStrategy} by default
 */
@Injectable({
  providedIn: 'root',
  useExisting: SingleAppBoundarySharingStrategy,
})
export abstract class BoundarySharingStrategy {
  /**
   * Retrieves array of all currently known {@link ElementBoundary}
   */
  abstract getBoundaries(): Observable<ElementBoundary[]>;

  /**
   * Add one {@link ElementBoundary}
   */
  abstract addBoundary(boundary: ElementBoundary): void;
}
