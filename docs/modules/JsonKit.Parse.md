[@kit-p/json-kit - v2.0.0](../README.md) / [Exports](../modules.md) / [JsonKit](JsonKit.md) / Parse

# Namespace: Parse

[JsonKit](JsonKit.md).Parse

## Table of contents

### Type Aliases

- [ParseOptions](JsonKit.Parse.md#parseoptions)
- [ParseReviverFunction](JsonKit.Parse.md#parsereviverfunction)

### Functions

- [decompressString](JsonKit.Parse.md#decompressstring)
- [parse](JsonKit.Parse.md#parse)

## Type Aliases

### ParseOptions

Ƭ **ParseOptions**: `Object`

Type for the `options` parameter of [parse](JsonKit.Parse.md#parse).

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `decompress?` | `boolean` \| { `enable`: `boolean`  } | Specifies if the input string is compressed with [`lz4js.compress()`](https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557). **`Remarks`** Will automatically disable if the decompression fails. **`Default Value`** `true` |
| `extended?` | `boolean` \| { `enable`: `boolean` ; `relaxed?`: `boolean`  } | Specifies if the input string is in JSON or EJSON format, additional options to be passed into [`bson.EJSON.parse()`](https://github.com/mongodb/js-bson#ejsonparsetext-options) can be supplied with the long form (only effective if `enable` is `true`. **`Default Value`** `false` |
| `unminify?` | `boolean` \| { `enable`: `boolean` ; `keyMap?`: `Record`<`string`, `string`\>  } | Specifies if the input string is created with the `minify` option enabled in [stringify](JsonKit.Stringify.md#stringify), a custom key map (shortened:original) can be supplied with the long form (only effective if `enable` is `true`. **`Remarks`** Will automatically disable if the unminifcation fails. **`Default Value`** `true` |

#### Defined in

[parse.ts:22](https://github.com/Kit-p/json-kit/blob/af9e51f/src/parse.ts#L22)

___

### ParseReviverFunction

Ƭ **ParseReviverFunction**: (`this`: `any`, `key`: `string`, `value`: `any`) => `any`

#### Type declaration

▸ (`this`, `key`, `value`): `any`

Type for the `reviver` parameter of [parse](JsonKit.Parse.md#parse).
Refer to [the MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#the_reviver_parameter) for more details.

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `any` |
| `key` | `string` |
| `value` | `any` |

##### Returns

`any`

#### Defined in

[parse.ts:12](https://github.com/Kit-p/json-kit/blob/af9e51f/src/parse.ts#L12)

## Functions

### decompressString

▸ **decompressString**(`str`): `string`

Decompresses a string with [`lz4js.decompress()`](https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L538).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `str` | `string` | The input string |

#### Returns

`string`

str - The decompressed string

#### Defined in

[parse.ts:352](https://github.com/Kit-p/json-kit/blob/af9e51f/src/parse.ts#L352)

___

### parse

▸ **parse**<`T`\>(`text`, `reviver?`, `options?`, `typeGuard?`): `T`

Turns the input string into an object.

**`Remarks`**

With the custom options, the input string can be either
 - a JSON string (identical to [`JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse))
 - an EJSON string (identical to [`bson.EJSON.parse()`](https://github.com/mongodb/js-bson#ejsonparsetext-options))
 - a minified version of either of the above, where some or specified keys are replaced with a shorter identifier
 - a compressed version (by [`lz4js.compress()`](https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557)) of either of the above

**`Example`**

```ts
type Foo {
  long_key: string
}

parse<Foo>(
  "{\"lk\":\"A Large Object\"}",
  (key, val) => {
    if (key === "lk") {
      return "A Modified Large Object"
    }
    return val
  },
  {
    extended: false,
    unminify: { enable: true, keyMap: { "lk": "long_key" } },
    decompress: false
  },
  (obj: any): obj is Foo => {
    const _obj: Partial<Foo> | null | undefined = obj
    return typeof _obj?.long_key === "string"
  }
)
```

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Type of the output object |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `text` | `string` | The input string |
| `reviver?` | ``null`` \| [`ParseReviverFunction`](JsonKit.Parse.md#parsereviverfunction) | The `reviver` parameter of [`JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#the_reviver_parameter) |
| `options?` | ``null`` \| [`ParseOptions`](JsonKit.Parse.md#parseoptions) | The custom options, refer to [ParseOptions](JsonKit.Parse.md#parseoptions) for details |
| `typeGuard?` | [`TypeGuardFunction`](JsonKit.Types.md#typeguardfunction)<`T`\> | The type guard function, ensures that the output object is of the expected type, refer to [TypeGuardFunction](JsonKit.Types.md#typeguardfunction) for an example. |

#### Returns

`T`

The output object

#### Defined in

[parse.ts:185](https://github.com/Kit-p/json-kit/blob/af9e51f/src/parse.ts#L185)

▸ **parse**<`T`\>(`text`, `options?`, `typeGuard?`): `T`

Turns the input string into an object.

**`Remarks`**

With the custom options, the input string can be either
 - a JSON string (identical to [`JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse))
 - an EJSON string (identical to [`bson.EJSON.parse()`](https://github.com/mongodb/js-bson#ejsonparsetext-options))
 - a minified version of either of the above, where some or specified keys are replaced with a shorter identifier
 - a compressed version (by [`lz4js.compress()`](https://github.com/Benzinga/lz4js/blob/73728a9c3c6a417ab9ce622fa112dc1cf04b00fd/lz4.js#L557)) of either of the above

**`Example`**

```ts
type Foo {
  long_key: string
}

parse<Foo>(
  "{\"lk\":\"A Large Object\"}",
  {
    extended: false,
    unminify: { enable: true, keyMap: { "lk": "long_key" } },
    decompress: false
  },
  (obj: any): obj is Foo => {
    const _obj: Partial<Foo> | null | undefined = obj
    return typeof _obj?.long_key === "string"
  }
)
```

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Type of the output object |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `text` | `string` | The input string |
| `options?` | ``null`` \| [`ParseOptions`](JsonKit.Parse.md#parseoptions) | The custom options, refer to [ParseOptions](JsonKit.Parse.md#parseoptions) for details |
| `typeGuard?` | [`TypeGuardFunction`](JsonKit.Types.md#typeguardfunction)<`T`\> | The type guard function, ensures that the output object is of the expected type, refer to [TypeGuardFunction](JsonKit.Types.md#typeguardfunction) for an example. |

#### Returns

`T`

The output object

#### Defined in

[parse.ts:230](https://github.com/Kit-p/json-kit/blob/af9e51f/src/parse.ts#L230)
