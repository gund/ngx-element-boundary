import {
  Directive,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

import { ElementBoundaryService } from './element-boundary.service';
import { HookableInjector } from './hookable-injector';

/**
 * Directive allows to specify contextual "element boundary"
 * at specific location in Angular Template
 *
 * Usually useful to mark content projections:
 * ```html
 *  <div nebElementBoundary>
 *    <ng-content></ng-content>
 *  </div>
 * ```
 */
@Directive({
  selector: '[nebElementBoundary]',
})
export class ElementBoundaryDirective implements OnInit, OnChanges {
  /** Override default {@link Injector} */
  @Input() nebElementBoundary?: Injector;

  private hookableInjector = new HookableInjector(this.injector);

  constructor(
    private injector: Injector,
    private elemRef: ElementRef,
    private elementBoundaryService: ElementBoundaryService,
  ) {}

  ngOnInit(): void {
    this.elementBoundaryService.addBoundary({
      injector: this.hookableInjector,
      element: this.elemRef.nativeElement,
      isComponent: false,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('nebElementBoundary' in changes) {
      if (this.nebElementBoundary) {
        this.hookableInjector.hook(this.nebElementBoundary);
      } else {
        this.hookableInjector.unhook();
      }
    }
  }
}
