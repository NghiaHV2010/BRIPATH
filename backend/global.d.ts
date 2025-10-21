declare module "cors";
declare module 'cookie-parser';

// Relax Generator interface to avoid [Symbol.dispose] requirement from ESNext.Disposable
interface Generator<T = unknown, TReturn = any, TNext = unknown> {
  next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
  return?(value: TReturn): IteratorResult<T, TReturn>;
  throw?(e: any): IteratorResult<T, TReturn>;
  [Symbol.iterator](): Generator<T, TReturn, TNext>;
}
