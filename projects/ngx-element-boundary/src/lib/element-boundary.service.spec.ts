import { TestBed } from '@angular/core/testing';

import { ElementBoundaryService } from './element-boundary.service';

describe('ElementBoundaryService', () => {
  let service: ElementBoundaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElementBoundaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
