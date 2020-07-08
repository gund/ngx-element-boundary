import { Component, Optional } from '@angular/core';

import { Child2Component } from '../child2/child2.component';
import { ExampleService } from '../example.service';

@Component({
  selector: 'app-child3',
  template: `
    <p>child3 ExampleService: {{ exampleService | json }}</p>
    <p>child3 Child2Component: {{ child2ComponentName | json }}</p>
    <span appElementBoundary>
      <ng-content></ng-content>
    </span>
  `,
})
export class Child3Component {
  child2ComponentName = this.child2?.constructor.name;

  constructor(
    @Optional() public exampleService?: ExampleService,
    @Optional() public child2?: Child2Component,
  ) {
    console.log('Child3 ExampleService', exampleService);
    console.log('Child3 Child2Component', child2);
  }
}
