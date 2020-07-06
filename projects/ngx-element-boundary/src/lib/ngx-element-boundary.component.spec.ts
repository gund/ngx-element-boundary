import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxElementBoundaryComponent } from './ngx-element-boundary.component';

describe('NgxElementBoundaryComponent', () => {
  let component: NgxElementBoundaryComponent;
  let fixture: ComponentFixture<NgxElementBoundaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxElementBoundaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxElementBoundaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
