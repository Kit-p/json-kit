/**
 * A function that checks the input object against a specific type.
 *
 * @typeParam T - The type to check against
 *
 * @example
 * ```ts
 * type Foo {
 *   bar: number
 * }
 *
 * function isFoo(obj: any): obj is Foo {
 *   const _obj: Partial<Foo> | null | undefined = obj
 *   return typeof _obj?.bar === "number"
 * }
 * ```
 */
export type TypeGuardFunction<T> = (obj: any) => obj is T;
