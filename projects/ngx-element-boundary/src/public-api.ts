/*
 * Public API Surface of ngx-element-boundary
 */

export * from './lib/element-boundary.module';
export * from './lib/element-boundary.service';
export * from './lib/element-boundary.directive';

export * from './lib/types';
export * from './lib/hookable-injector';
export * from './lib/cross-boundary-ng-element-strategy';
export * from './lib/element-boundary-ng-element-strategy';

export * from './lib/component-selector-strategy/component-selector-strategy';
export * from './lib/component-selector-strategy/prefix-component-selector-strategy';
export * from './lib/component-selector-strategy/regex-component-selector-strategy';

export * from './lib/boundary-sharing-strategy/boundary-sharing-strategy';
export * from './lib/boundary-sharing-strategy/single-app-boundary-sharing-strategy';
export * from './lib/boundary-sharing-strategy/global-boundary-sharing-strategy';

// Internal shared utils
export * from './lib/util';
