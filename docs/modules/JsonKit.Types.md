[@kit-p/json-kit - v2.0.0](../README.md) / [Exports](../modules.md) / [JsonKit](JsonKit.md) / Types

# Namespace: Types

[JsonKit](JsonKit.md).Types

## Table of contents

### Type Aliases

- [TypeGuardFunction](JsonKit.Types.md#typeguardfunction)

## Type Aliases

### TypeGuardFunction

Ƭ **TypeGuardFunction**<`T`\>: (`obj`: `any`) => obj is T

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type to check against |

#### Type declaration

▸ (`obj`): obj is T

A function that checks the input object against a specific type.

**`Example`**

```ts
type Foo {
  bar: number
}

function isFoo(obj: any): obj is Foo {
  const _obj: Partial<Foo> | null | undefined = obj
  return typeof _obj?.bar === "number"
}
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `any` |

##### Returns

obj is T

#### Defined in

[types.ts:18](https://github.com/Kit-p/json-kit/blob/af9e51f/src/types.ts#L18)
