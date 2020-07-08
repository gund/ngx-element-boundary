# ngx-element-boundary

> Strategy for `@angular/elements` that allows to inherit `Injector`s
> between all Angular Custom Elements just like default Angular Component do

## Compatibility table

| Angular | ngx-element-boundary | NPM package                   |
| ------- | -------------------- | ----------------------------- |
| 10.x.x  | 1.x.x                | `ngx-element-boundary@^1.0.0` |

_NOTE:_ For Angular versions below v10 it may work but was not tested.

## Install

```bash
$ npm install ngx-element-boundary
```

## Why

Main limitation when exposing Angular Components as Custom Elements
is that their `Injector`s will not inherit properly when placed
in proper hierarchy in the DOM tree.

However this is expected behavior when using classical Angular Components -
their `Injector`s are properly inherited and you a lot of times rely on it
to implement nice patterns.

_Solves https://github.com/angular/angular/issues/24824_

## How

By default `@angular/elements` allows you to convert any Angular Component
into Custom Element with the limitation above.

It also allows to override default `NgElementStrategy` that is used inside
to manage conversion process from Angular Component to Custom Element.

This library implements
[`CrossBoundaryNgElementStrategy`](projects/ngx-element-boundary/src/lib/cross-boundary-ng-element-strategy.ts)
that is capable of tracking Angular Custom Elements created in DOM
and setting up proper `Injector` chain between them.

It also does not re-implement default `NgElementStrategy` but requires
you to pass base strategy factory into it's own factory.

To simplify use-case there is an extractor factory of default
`NgElementStrategy` that is provided by `@angular/elements` -
[`DefaultElementBoundaryNgElementStrategyFactory`](projects/ngx-element-boundary/element-strategy/default/src/element-boundary-ng-element-strategy.ts)

## Usage

All you have to do is to use custom `NgElementStrategy` called
[`CrossBoundaryNgElementStrategy`](projects/ngx-element-boundary/src/lib/cross-boundary-ng-element-strategy.ts)
when you are converting your Angular Component to Custom Element:

```ts
import { Component } from '@angular/core';
import { createCustomElement } from '@angular/element';
import { CrossBoundaryNgElementStrategyFactory } from 'ngx-element-boundary';
import { DefaultElementBoundaryNgElementStrategyFactory } from 'ngx-element-boundary/element-strategy/default';

@Component()
class MyAwesomeComponent {}

// First create the default strategy
const defaultElementBoundaryStrategyFactory = new DefaultElementBoundaryNgElementStrategyFactory(
  MyAwesomeComponent,
  injector,
);

// Then create the cross boundary strategy that uses the default one
const connectedNgElementStrategyFactory = new CrossBoundaryNgElementStrategyFactory(
  defaultElementBoundaryStrategyFactory,
  {
    isRoot: true, // Set to `true` for ONLY top-level custom element
  },
);

const MyAwesomeCustomElement = createCustomElement(MyAwesomeComponent, {
  injector: injector,
  strategyFactory: connectedNgElementStrategyFactory,
});

customElements.define('my-awesome', MyAwesomeCustomElement);
```

As long as your Custom Elements are created using `CrossBoundaryNgElementStrategy`
they will properly inherit each other `Injector`s.

### Template Injector

Most of the times when your component projects content in template
it does so in specific place in the view that may have it's own
tree of `Injector`s.

And by default the strategy will only inherit component level `Injector`s
even if the projection was done on a deeper level.

In that case projected Custom Element will see top level `Injector`
of the parent Custom Element and not the one it projected into.

To fix this issue you may tell the library where exactly you are having
content projection in your view by using
[`ElementBoundaryDirective`](projects/ngx-element-boundary/src/lib/element-boundary.directive.ts).

So in your component's template mark content projection with the directive:

```html
<some-ng-component>
  <div nebElementBoundary>
    <ng-content></ng-content>
  </div>
</some-ng-component>
```

_NOTE:_ This directive is exported from `ElementBoundaryModule`.

Once you do that - any projected Custom Element will resolve `Injector`
at the level that `ElementBoundaryDirective` is at, meaning that -
Custom Element will be able to inject `some-ng-component`.

## Base Strategy

As you might have already understood - this library does not re-implement
the default `NgElementStrategy` but only augments the base strategy by
setting up proper `Injector` tree between Custom Elements.

That means that the strategy
[`CrossBoundaryNgElementStrategy`](projects/ngx-element-boundary/src/lib/cross-boundary-ng-element-strategy.ts)
requires you to pass another strategy.

That other strategy is not same as `NgElementStrategy` as it needs
access to the `ComponentRef` to be able to get Custom Element's `Injector`.

For that purpose library defines new version of `NgElementStrategy` called -
[`ElementBoundaryNgElementStrategy`](projects/ngx-element-boundary/src/lib/element-boundary-ng-element-strategy.ts).

It also defines new version of `NgElementStrategyFactory` called -
[`ElementBoundaryNgElementStrategyFactory`](projects/ngx-element-boundary/src/lib/element-boundary-ng-element-strategy.ts).

## Default Strategy

In most cases you would want to reuse the same `NgElementStrategy`
that `@angular/elements` uses by default.

For this purpose library has secondary entry-point that contains
all the functionality required - `ngx-element-boundary/element-strategy/default`.

In general you should use
[`DefaultElementBoundaryNgElementStrategyFactory`](projects/ngx-element-boundary/element-strategy/default/src/element-boundary-ng-element-strategy.ts)
as the base `ElementBoundaryNgElementStrategyFactory`.

What it does is the following:

- Uses strategy `DefaultNgElementStrategyFactoryStrategy` to
  create default `NgElementStrategyFactory`
- Uses `DefaultElementBoundaryNgElementStrategy` to bridge
  between default `NgElementStrategy` and `ElementBoundaryNgElementStrategy`

By default it uses built-in way to extract default `NgElementStrategyFactory`.
And because Angular Team decided to not expose it as part of public API
there are some private API accesses involved and they may brake at any time.

Should that brake - you may still recover by providing updated functions
to access private APIs all without the need to wait for new release.

There are 2 places where private API access is performed:

- To extract `NgElementStrategy` from the Custom Element:
  Performed in the
  [`DefaultNgElementStrategyFactory`](projects/ngx-element-boundary/element-strategy/default/src/default-ng-element-strategy.ts)
  via the `NgElementStrategyExtractor`.
  You may provide custom extractor in `DefaultNgElementStrategyFactoryOptions`.
- To extract `ComponentRef` from the `NgElementStrategy`:
  Performed in the
  [`DefaultElementBoundaryNgElementStrategy`](projects/ngx-element-boundary/element-strategy/default/src/element-boundary-ng-element-strategy.ts)
  via the `NgElementStrategyComponentRefExtractor`.
  You may provide custom extractor in `DefaultElementBoundaryNgElementStrategyOptions`.

Creation of the default `NgElementStrategy` is done in
[`DefaultNgElementStrategyFactory`](projects/ngx-element-boundary/element-strategy/default/src/default-ng-element-strategy.ts)
by creating a dummy Custom Element using `createCustomElement()` function
from the `@angular/elements` with default option for the strategy.

If you have a better way of creating the default `NgElementStrategy`
you may implement it as `DefaultNgElementStrategyFactoryStrategy` and then provide it in
[`DefaultElementBoundaryNgElementStrategyFactoryOptions.factoryStrategy`](projects/ngx-element-boundary/element-strategy/default/src/element-boundary-ng-element-strategy.ts).

_NOTE:_ Default strategy extraction was inspired by https://github.com/remackgeek/elements-zone-strategy

---

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
