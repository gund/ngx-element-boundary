import { Component, Optional } from '@angular/core';

import { ExampleService } from '../example.service';

@Component({
  selector: 'app-child2',
  template: `
    <p>child2 ExampleService: {{ exampleService | json }}</p>
    <span appElementBoundary>
      <ng-content></ng-content>
    </span>
  `,
})
export class Child2Component {
  constructor(@Optional() public exampleService?: ExampleService) {
    console.log('Child2 ExampleService', exampleService);
  }
}
