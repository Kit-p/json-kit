[@kit-p/json-kit - v2.0.0](../README.md) / [Exports](../modules.md) / [JsonKit](JsonKit.md) / Serialize

# Namespace: Serialize

[JsonKit](JsonKit.md).Serialize

## Table of contents

### Functions

- [deserialize](JsonKit.Serialize.md#deserialize)
- [serialize](JsonKit.Serialize.md#serialize)

## Functions

### deserialize

▸ **deserialize**<`T`\>(`obj`, `typeGuard?`): `T`

Turns the input object into an JSON object.

**`Remarks`**

It is equivalent to (except a bit more performant due to custom options)
```ts
let obj = { ... }
parse(stringify(obj), { extended: true })
```

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Type of the output object |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `obj` | `any` | The input object |
| `typeGuard?` | [`TypeGuardFunction`](JsonKit.Types.md#typeguardfunction)<`T`\> | The type guard function, ensures that the output object is of the expected type, refer to [TypeGuardFunction](JsonKit.Types.md#typeguardfunction) for an example. |

#### Returns

`T`

The JSON object

#### Defined in

[serialize.ts:55](https://github.com/Kit-p/json-kit/blob/af9e51f/src/serialize.ts#L55)

___

### serialize

▸ **serialize**<`T`\>(`obj`, `typeGuard?`): `T`

Turns the input object into an EJSON object.

**`Remarks`**

It is equivalent to (except a bit more performant due to custom options)
```ts
let obj = { ... }
parse(stringify(obj, { extended: true }))
```

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Type of the output object |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `obj` | `any` | The input object |
| `typeGuard?` | [`TypeGuardFunction`](JsonKit.Types.md#typeguardfunction)<`T`\> | The type guard function, ensures that the output object is of the expected type, refer to [TypeGuardFunction](JsonKit.Types.md#typeguardfunction) for an example. |

#### Returns

`T`

The EJSON object

#### Defined in

[serialize.ts:20](https://github.com/Kit-p/json-kit/blob/af9e51f/src/serialize.ts#L20)
