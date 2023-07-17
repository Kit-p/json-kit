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
