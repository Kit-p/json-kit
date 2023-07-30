/**
 * Array of identifiers that can be used as the initial part of a constructed identifier.
 *
 * @privateRemarks
 * This is not intended to be used publicly.
 *
 * @internal
 */
export const MINIFY_STARTING_CANDIDATES = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
] as const;

/**
 * Array of identifiers that can be used as the remaining part of a constructed identifier.
 *
 * @privateRemarks
 * This is not intended to be used publicly.
 *
 * @internal
 */
export const MINIFY_REMAINING_CANDIDATES = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  ...MINIFY_STARTING_CANDIDATES,
] as const;
