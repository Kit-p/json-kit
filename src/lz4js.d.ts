/**
 * Module declaration for the `lz4js` dependency.
 *
 * @remarks
 * The type definitions for the APIs reference {@link https://github.com/Benzinga/lz4js#api | the package documentation}.
 *
 * @privateRemarks
 * The type `number[]` here assumes all numbers are unsigned 8-bit integers.
 *
 * @internal
 */
declare module 'lz4js' {
  export function compress(
    buffer: number[] | Uint8Array,
    maxSize?: number,
  ): number[] | Uint8Array;

  export function decompress(
    buffer: number[] | Uint8Array,
    maxSize?: number,
  ): number[] | Uint8Array;
}
