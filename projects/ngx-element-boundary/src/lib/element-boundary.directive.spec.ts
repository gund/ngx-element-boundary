import { TestBed } from '@angular/core/testing';

import { ElementBoundaryDirective } from './element-boundary.directive';
import { Component, Injector } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ElementBoundaryDirective', () => {
  @Component({
    selector: 'neb-test',
    template: `<div [nebElementBoundary]="injector"></div>`,
  })
  class TestComponent {
    injector?: Injector;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ElementBoundaryDirective, TestComponent],
    });
  });

  it('should attach to attribute', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const directiveElem = fixture.debugElement.query(
      By.directive(ElementBoundaryDirective),
    );

    expect(directiveElem).toBeTruthy();
  });
});
