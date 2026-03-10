import { pathMap } from "./pathMap.ts";

export type PathStrings = (typeof pathMap)[keyof typeof pathMap];
// Utility type to extract keys from the route string
// takes param T constrained to string
export type ExtractPathParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? (Param extends "" ? never : Param) | ExtractPathParams<`/${Rest}`>
  : T extends `${infer _Start}:${infer Param}`
  ? Param extends "" ? never : Param
  : never;

export type PathParams<T extends string> =
  ExtractPathParams<T> extends never
  ? Record<string, never>
  : Record<ExtractPathParams<T>, string>;

export type HasPathParams<T extends string> =
  T extends `${infer _Start}:${infer _Param}/${infer _Rest}`
  ? true
  : T extends `${infer _Start}:${infer _Param}`
  ? true
  : false;

export type PathsWithParams = {
  [K in keyof typeof pathMap]: HasPathParams<(typeof pathMap)[K]> extends true
  ? (typeof pathMap)[K]
  : never;
}[keyof typeof pathMap];

export type PathsWithoutParams = {
  [K in keyof typeof pathMap]: HasPathParams<(typeof pathMap)[K]> extends false
  ? (typeof pathMap)[K]
  : never;
}[keyof typeof pathMap];
