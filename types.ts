export const Routes = {
  poll: "https://jsonplaceholder.typicode.com/posts/:postId",
  noParams: "http://jsonplaceholder.typicode.com/posts"
} as const;

export type RouteStrings = (typeof Routes)[keyof typeof Routes];
// Utility type to extract keys from the route string
// takes param T constrained to string
export type ExtractRouteParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? (Param extends "" ? never : Param) | ExtractRouteParams<`/${Rest}`>
  : T extends `${infer _Start}:${infer Param}`
  ? Param extends "" ? never : Param
  : never;

export type RouteParams<T extends string> =
  ExtractRouteParams<T> extends never
  ? Record<string, never>
  : Record<ExtractRouteParams<T>, string>;

export type HasPathParams<T extends string> =
  T extends `${infer _Start}:${infer _Param}/${infer _Rest}`
  ? true
  : T extends `${infer _Start}:${infer _Param}`
  ? true
  : false;

export type RoutesWithParams = {
  [K in keyof typeof Routes]: HasPathParams<(typeof Routes)[K]> extends true
  ? (typeof Routes)[K]
  : never;
}[keyof typeof Routes];

export type RoutesWithoutParams = {
  [K in keyof typeof Routes]: HasPathParams<(typeof Routes)[K]> extends false
  ? (typeof Routes)[K]
  : never;
}[keyof typeof Routes];
