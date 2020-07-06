import { Injector } from '@angular/core';

/**
 * Implements {@link Injector} that allows to hook in
 * another {@link Injector} at runtime
 */
export class HookableInjector implements Injector {
  private static readonly EMPTY = {};

  private hookedInjector: Injector = Injector.NULL;

  constructor(private parentInjector: Injector) {}

  hook(injector: Injector): void {
    this.hookedInjector = injector;
  }

  unhook(): void {
    this.hookedInjector = Injector.NULL;
  }

  get(token: any, notFoundValue?: any): any {
    const value = this.hookedInjector.get<any>(token, HookableInjector.EMPTY);

    if (value === HookableInjector.EMPTY) {
      return this.parentInjector.get<any>(token, notFoundValue);
    }

    return value;
  }
}
