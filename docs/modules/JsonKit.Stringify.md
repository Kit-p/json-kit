[@kit-p/json-kit - v2.0.0](../README.md) / [Exports](../modules.md) / [JsonKit](JsonKit.md) / Stringify

# Namespace: Stringify

[JsonKit](JsonKit.md).Stringify

## Table of contents

### Type Aliases

- [StringifyOptions](JsonKit.Stringify.md#stringifyoptions)
- [StringifyReplacerArray](JsonKit.Stringify.md#stringifyreplacerarray)
- [StringifyReplacerFunction](JsonKit.Stringify.md#stringifyreplacerfunction)

### Functions

- [compressString](JsonKit.Stringify.md#compressstring)
- [stringify](JsonKit.Stringify.md#stringify)

## Type Aliases

### StringifyOptions

Ƭ **StringifyOptions**: `Object`

Type for the `options` parameter of [stringify](JsonKit.Stringify.md#stringify).

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `compress?` | `boolean` \| { `enable`: `boolean`  } | Determines if the output string will be compressed with [`lz4js.compress()`](https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557). **`Default Value`** `false` |
| `extended?` | `boolean` \| { `enable`: `boolean` ; `relaxed?`: `boolean`  } | Determines if the output string is in JSON or EJSON format, additional options to be passed into [`bson.EJSON.stringify()`](https://github.com/mongodb/js-bson#ejsonstringifyvalue-replacer-space-options) can be supplied with the long form (only effective if `enable` is `true`. **`Default Value`** `false` |
| `minify?` | `boolean` \| { `enable`: `boolean` ; `keyMap?`: `Record`<`string`, `string`\>  } | Determines if the output string will have some of the keys replaced with a shorter identifier, a custom key map (original:shortened) can be supplied with the long form (only effective if `enable` is `true`. **`Default Value`** `false` |

#### Defined in

[stringify.ts:37](https://github.com/Kit-p/json-kit/blob/af9e51f/src/stringify.ts#L37)

___

### StringifyReplacerArray

Ƭ **StringifyReplacerArray**: (`string` \| `number`)[]

`Array` type for the `replacer` parameter of [stringify](JsonKit.Stringify.md#stringify).
Refer to [the MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter) for more details.

#### Defined in

[stringify.ts:16](https://github.com/Kit-p/json-kit/blob/af9e51f/src/stringify.ts#L16)

___

### StringifyReplacerFunction

Ƭ **StringifyReplacerFunction**: (`this`: `any`, `key`: `string`, `value`: `any`) => `any`

#### Type declaration

▸ (`this`, `key`, `value`): `any`

`Function` type for the `replacer` parameter of [stringify](JsonKit.Stringify.md#stringify).
Refer to [the MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter) for more details.

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `any` |
| `key` | `string` |
| `value` | `any` |

##### Returns

`any`

#### Defined in

[stringify.ts:23](https://github.com/Kit-p/json-kit/blob/af9e51f/src/stringify.ts#L23)

## Functions

### compressString

▸ **compressString**(`str`): `string`

Compresses a string with [`lz4js.compress()`](https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `str` | `string` | The input string |

#### Returns

`string`

str - The compressed string

#### Defined in

[stringify.ts:407](https://github.com/Kit-p/json-kit/blob/af9e51f/src/stringify.ts#L407)

___

### stringify

▸ **stringify**(`obj`, `replacer?`, `space?`, `options?`): `string`

Turns the input object into a string.

**`Remarks`**

With the custom options, the output string can be either
 - a JSON string (identical to [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify))
 - an EJSON string (identical to [`bson.EJSON.stringify()`](https://github.com/mongodb/js-bson#ejsonstringifyvalue-replacer-space-options))
 - a minified version of either of the above, where some or specified keys will be replaced with a shorter identifier
 - a compressed version (by [`lz4js.compress()`](https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557)) of either of the above

**`Example`**

```ts
stringify(
  { long_key: "A Large Object" },
  (key, val) => {
    if (key === "long_key") {
      return "A Modified Large Object"
    }
    return val
  },
  2,
  {
    extended: false,
    minify: { enable: true, keyMap: { long_key: "lk" } },
    compress: false
  }
)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `obj` | `any` | The input object |
| `replacer?` | ``null`` \| [`StringifyReplacerArray`](JsonKit.Stringify.md#stringifyreplacerarray) \| [`StringifyReplacerFunction`](JsonKit.Stringify.md#stringifyreplacerfunction) | The `replacer` parameter of [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter) |
| `space?` | ``null`` \| `string` \| `number` | The `space` parameter of [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_space_parameter) |
| `options?` | ``null`` \| [`StringifyOptions`](JsonKit.Stringify.md#stringifyoptions) | The custom options, refer to [StringifyOptions](JsonKit.Stringify.md#stringifyoptions) for details |

#### Returns

`string`

The output string

#### Defined in

[stringify.ts:186](https://github.com/Kit-p/json-kit/blob/af9e51f/src/stringify.ts#L186)

▸ **stringify**(`obj`, `options?`): `string`

Turns the input object into a string.

**`Remarks`**

With the custom options, the output string can be either
 - a JSON string (identical to [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify))
 - an EJSON string (identical to [`bson.EJSON.stringify()`](https://github.com/mongodb/js-bson#ejsonstringifyvalue-replacer-space-options))
 - a minified version of either of the above, where some or specified keys will be replaced with a shorter identifier
 - a compressed version (by [`lz4js.compress()`](https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557)) of either of the above

**`Example`**

```ts
stringify(
  { long_key: "A Large Object" },
  {
    extended: false,
    minify: { enable: true, keyMap: { long_key: "lk" } },
    compress: false
  }
)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `obj` | `any` | The input object |
| `options?` | ``null`` \| [`StringifyOptions`](JsonKit.Stringify.md#stringifyoptions) | The custom options, refer to [StringifyOptions](JsonKit.Stringify.md#stringifyoptions) for details |

#### Returns

`string`

The output string

#### Defined in

[stringify.ts:221](https://github.com/Kit-p/json-kit/blob/af9e51f/src/stringify.ts#L221)
