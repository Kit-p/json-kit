/**
 * @param target target function to measure
 * @returns Array of [result, durationInMs]
 */
export function timer<const T>(target: () => T): [T, number];
export async function timer<const T extends Promise<any>>(
  target: () => T,
): Promise<[Awaited<T>, number]>;
export function timer(
  target: () => any,
): [any, number] | Promise<[any, number]> {
  const start = performance.now();
  const result = target();
  if (typeof result?.then === 'function') {
    return new Promise((resolve, reject) => {
      result
        .then((awaited: any) => {
          const durationInMs = performance.now() - start;
          return resolve([awaited, durationInMs]);
        })
        .catch((error: any) => reject(error));
    });
  } else {
    const durationInMs = performance.now() - start;
    return [result, durationInMs];
  }
}
