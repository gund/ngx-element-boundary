import { Component, Optional } from '@angular/core';

import { ExampleService } from '../example.service';

@Component({
  selector: 'app-child1',
  template: `
    <p>child1 works!</p>
    <span appElementBoundary>
      <ng-content></ng-content>
    </span>
  `,
  providers: [ExampleService],
})
export class Child1Component {
  constructor(exampleService: ExampleService) {
    console.log('Child1 ExampleService', exampleService);
  }
}
