import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Provider } from '@angular/core';

import { ElementBoundaryDirective } from './element-boundary.directive';

/**
 * Options for {@link ElementBoundaryModule}
 */
export interface ElementBoundaryModuleOptions {
  /**
   * Provider for {@link ComponentSelectorStrategy}
   */
  componentSelectorStrategyProvider?: Provider;
  /**
   * Provider for {@link BoundarySharingStrategy}
   */
  boundarySharingStrategyProvider?: Provider;
}

/**
 * Provides component/directives for managing and
 * configuring element boundaries
 */
@NgModule({
  imports: [CommonModule],
  exports: [ElementBoundaryDirective],
  declarations: [ElementBoundaryDirective],
})
export class ElementBoundaryModule {
  /**
   * Optionally configure the module in your root module
   */
  static configure({
    componentSelectorStrategyProvider,
    boundarySharingStrategyProvider,
  }: ElementBoundaryModuleOptions): ModuleWithProviders<ElementBoundaryModule> {
    return {
      ngModule: ElementBoundaryModule,
      providers: [
        componentSelectorStrategyProvider ?? [],
        boundarySharingStrategyProvider ?? [],
      ],
    };
  }
}
