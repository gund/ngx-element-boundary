import { ReplaySubject, Observable, ObservedValueOf } from 'rxjs';
import { switchAll } from 'rxjs/operators';

/** @internal */
export function isDefined<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/**
 * Allows to defer initialization of the stream
 * by creating initial stream before hand and intercept the value
 * once it's available in setter and switch to it from initial stream
 *
 * @internal
 */
export function maybeLateInitStream<
  T,
  P extends keyof T,
  R = ObservedValueOf<T[P]>,
>(object: T, prop: P): Observable<R> {
  if (object[prop]) {
    return object[prop] as any;
  }

  const setValue$ = new ReplaySubject<Observable<R>>(1);
  const value$ = setValue$.pipe(switchAll());

  Object.defineProperty(object, prop, {
    configurable: true,
    enumerable: true,
    get: () => value$,
    set: (value) => setValue$.next(value),
  });

  return value$;
}
