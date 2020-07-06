import { ComponentRef, Injector } from '@angular/core';
import { NgElementStrategy, NgElementStrategyFactory } from '@angular/elements';

/**
 * Represents {@link NgElementStrategy} with ability
 * to request underlying {@link ComponentRef}
 */
export interface ElementBoundaryNgElementStrategy extends NgElementStrategy {
  getComponentRef(): ComponentRef<any> | undefined;
}

/**
 * Represents {@link NgElementStrategyFactory} that
 * creates instance of {@link ElementBoundaryNgElementStrategy}
 */
export interface ElementBoundaryNgElementStrategyFactory
  extends NgElementStrategyFactory {
  create(injector: Injector): ElementBoundaryNgElementStrategy;
}
