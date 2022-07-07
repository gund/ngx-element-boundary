import {
  ComponentFactoryResolver,
  Injector,
  NgModule,
  Type,
} from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import {
  ComponentSelectorStrategy,
  CrossBoundaryNgElementStrategyFactory,
  ElementBoundaryModule,
  PrefixComponentSelectorStrategy,
} from 'ngx-element-boundary';
import { DefaultElementBoundaryNgElementStrategyFactory } from 'ngx-element-boundary/element-strategy/default';

import { Child1Component } from './child1/child1.component';
import { Child2Component } from './child2/child2.component';
import { Child3Component } from './child3/child3.component';

interface ComponentDef {
  type: Type<any>;
  isRoot?: boolean;
}

@NgModule({
  imports: [
    BrowserModule,
    ElementBoundaryModule.configure({
      componentSelectorStrategyProvider: {
        provide: ComponentSelectorStrategy,
        useClass: PrefixComponentSelectorStrategy,
      },
    }),
  ],
  declarations: [Child1Component, Child2Component, Child3Component],
  providers: [
    PrefixComponentSelectorStrategy.provideOptions({ prefix: 'app-' }),
  ],
})
export class AppModule {
  private componentDefs: ComponentDef[] = [
    { type: Child3Component },
    { type: Child2Component },
    { type: Child1Component, isRoot: true },
  ];

  constructor(
    private injector: Injector,
    private cfr: ComponentFactoryResolver,
  ) {}

  ngDoBootstrap(): void {
    this.componentDefs
      .map((component) => this.initComponent(component))
      .forEach(({ name, customElement }) =>
        customElements.define(name, customElement),
      );
  }

  private initComponent({ type, isRoot }: ComponentDef) {
    const componentFactory = this.cfr.resolveComponentFactory(type);
    const name = componentFactory.selector;

    const defaultNgElementStrategyFactory =
      new DefaultElementBoundaryNgElementStrategyFactory(type, this.injector);

    const connectedNgElementStrategyFactory =
      new CrossBoundaryNgElementStrategyFactory(
        defaultNgElementStrategyFactory,
        { isRoot },
      );

    const customElement = createCustomElement(type, {
      injector: this.injector,
      strategyFactory: connectedNgElementStrategyFactory,
    });

    return { name, customElement };
  }
}
