import { TestBed } from '@angular/core/testing';

import { NgxElementBoundaryService } from './ngx-element-boundary.service';

describe('NgxElementBoundaryService', () => {
  let service: NgxElementBoundaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxElementBoundaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
