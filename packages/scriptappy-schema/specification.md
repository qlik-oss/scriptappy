# JavaScript API Specification

**Version 0.5.0**

> The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
[RFC 2119](https://tools.ietf.org/html/rfc2119).

## Table of Contents

- [Specification](#specification)
  - [Schema](#schema)
    - [Root Object](#root)
    - [Info Object](#infoObject)
    - [Entity Base](#type)
    - [Availability Object](#availability)
    - [Deprecated Object](#deprecated)
    - [Entity Tier 0](#entity-tier0)
    - [Entity Tier 1](#entity-tier1)
    - [Entity Tier 2](#entity-tier2)
    - [Entity Tier 3](#entity-tier3)
    - [Entity Tier 4](#entity-tier4)
    - [Literal](#kind.literal)
    - [Module](#kind.module)
    - [Object](#kind.object)
    - [Namespace](#kind.namespace)
    - [Function](#kind.function)
    - [Class](#kind.class)
    - [Constructor Object](#constructor)
    - [Interface](#kind.interface)
    - [Event](#kind.event)
    - [Array](#kind.array)
    - [Union](#kind.union)

## Definitions

#### Entity

An entity refers to an 'endpoint' in the API, e.g. a method, class, module, namespace etc.

#### Entity tier

The different entities are separated into _tiers_ to make referencing easier. When a tier is referenced, any of the entities in that tier are allowed in place of the tier.

## <a name="specification"></a> Specification

### <a name='schema'></a> Schema

#### <a name='root'></a> Root object

Field|Type|Description
---|---|---
spec | `const` `0.5.0` | **REQUIRED.** The specification version the document uses.
info | [Info object](#infoObject) | **REQUIRED.** Metadata about the API.
examples | Array&lt;`string`&gt; | Examples showing how to use this API.
entries | Map&lt;`string`, [Entity Object](#entityObject)&gt; | **REQUIRED.** An object holding the entry points available for the API.
definitions | Map&lt;`string`, [Entity Object](#entityObject)&gt; | Additional entities reachable through the entry points.

##### Example

```js
{
  spec: '0.5.0',
  info: { /* info object */ },
  entries: {
    getName: { /* entity object */ }
  },
  definitions: {
    Name: { /* entity object */ }
  }
}
```

#### <a name="infoObject"></a> Info Object

Field|Type|Description
---|---|---
name | `string` | Name of the API.
description | `string` | Description of the API.
version | `string` | **REQUIRED.** Version of the API.
license | `string` | **REQUIRED.** SPDX license identifier for the API.

##### Example

```js
{
  "name": "PaymentAPI",
  "description": "Pay me!",
  "version": "1.3.0",
  "license": "MIT"
}
```

#### <a name="type"></a> Entity Base

Field|Type|Description
---|---|---
description|`string`|A description of the entity.
stability|`'experimental'` \| `'stable'` \| `'locked'`|The stability of the entity.
availability|[Availability Object](#availability)|The availability of the entity.
examples|Array&lt;`string`&gt;|Examples showing how to use this entity.
type|`string`|The type of this entity.
name|`string`|Name of this entity.
optional|`boolean`|Optionality of this entity. Used to indicate when the entity is optional as a method parameter or an object entry.
nullable|`boolean`|Nullability of this entity. Used to indicate when the entity is nullable as a method parameter or an object entry.
variable|`boolean`|Variability of this entity. Used to indicate when the entity is repeatable as a method parameter.
generics|Array&lt;[Entity Tier 3](#entity-tier3)&gt;|Generic types.
defaultValue|`number` \| `boolean` \| `string`|Default value for this entity. Used when the entity is optional.

##### Example

```js
{
  "type": "number"
  "description": "Get the current amount",
  "stability": "stable",
  "availability": {
    "since": "1.1.0"
  },
  "optional": true,
  "defaultValue": 13
}
```

#### <a name="availability"></a> Availability Object

Field|Type|Description
---|---|---
since|`string`|API version from which owning entity is available.
deprecated|`boolean` \| [Deprecated Object](#deprecated)|Current deprecation status of owning entity.

##### Example

```js
{
  "since": "1.0.0",
  "deprecated": false
}
```

#### <a name="deprecated"></a> Deprecated Object

Field|Type|Description
---|---|---
since|`string`|**REQUIRED.** API version from which owning entity is considered deprecated.
description|`string`|A short description and a recommendation on what to use instead of the deprecated entity.

##### Example

```js
{
  "since": "1.4.5",
  "description": "Deprecated since 1.4.5, use something else instead :P."
}
```

#### <a name="entity-tier0"></a> Entity Tier 0
This tier is a collection of other entities, wherever this tier is referenced, the following entities are allowed:

[Module](#kind.module)

#### <a name="entity-tier1"></a> Entity Tier 1
This tier is a collection of other entities, wherever this tier is referenced, the following entities are allowed:

[Namespace](#kind.namespace)

#### <a name="entity-tier2"></a> Entity Tier 2
This tier is a collection of other entities, wherever this tier is referenced, the following entities are allowed:

[Class](#kind.class) | [Interface](#kind.interface)

#### <a name="entity-tier3"></a> Entity Tier 3
This tier is a collection of other entities, wherever this tier is referenced, the following entities are allowed:

[Entity Base](#type) | [Literal](#kind.literal) | [Object](#kind.object) | [Function](#kind.function) | [Array](#kind.array) | [Union](#kind.union)

#### <a name="entity-tier4"></a> Entity Tier 4
This tier is a collection of other entities, wherever this tier is referenced, the following entities are allowed:

[Event](#kind.event)

#### <a name="kind.literal"></a> Literal

> This entity extends from [Entity Base](#type) and accepts all its fields as well.

Field|Type|Description
---|---|---
kind|`const` `'literal'`|**REQUIRED.** 
value|`number` \| `boolean` \| `string`|**REQUIRED.** 

##### Example

```js
{
  "kind": "literal",
  "value": 13
}
```

#### <a name="kind.module"></a> Module

> This entity extends from [Entity Base](#type) and accepts all its fields as well.

Field|Type|Description
---|---|---
kind|`const` `'module'`|**REQUIRED.** 
entries|Object&lt;`string`, [Entity Tier 1](#entity-tier1) \| [Entity Tier 2](#entity-tier2) \| [Entity Tier 3](#entity-tier3)&gt;|An object.
definitions|Object&lt;`string`, [Entity Tier 1](#entity-tier1) \| [Entity Tier 2](#entity-tier2) \| [Entity Tier 3](#entity-tier3)&gt;|An object.
events|Object&lt;`string`, [Event](#kind.event)&gt;|An object.

##### Example

```js
{
  "kind": "module",
  "entries": {
    "a": { /* entity */ },
    "b": { /* entity */ }
  }
}
```

#### <a name="kind.object"></a> Object

> This entity extends from [Entity Base](#type) and accepts all its fields as well.

Field|Type|Description
---|---|---
kind|`const` `'object'`|**REQUIRED.** 
extends|Array&lt;[Entity Base](#type)&gt;|References to other entities this entity extends from.
implements|Array&lt;[Entity Base](#type)&gt;|References to other entities this entity implements.
entries|Object&lt;`string`, [Entity Tier 3](#entity-tier3)&gt;|An object.
definitions|Object&lt;`string`, [Entity Tier 3](#entity-tier3)&gt;|An object.
events|Object&lt;`string`, [Event](#kind.event)&gt;|An object.

##### Example

```js
{
  "kind": "object",
  "entries": {
    "prop": { /* entity */ }
  }
}
```

#### <a name="kind.namespace"></a> Namespace

> This entity extends from [Entity Base](#type) and accepts all its fields as well.

Field|Type|Description
---|---|---
kind|`const` `'namespace'`|**REQUIRED.** 
entries|Object&lt;`string`, [Entity Tier 1](#entity-tier1) \| [Entity Tier 2](#entity-tier2) \| [Entity Tier 3](#entity-tier3)&gt;|An object.
definitions|Object&lt;`string`, [Entity Tier 1](#entity-tier1) \| [Entity Tier 2](#entity-tier2) \| [Entity Tier 3](#entity-tier3)&gt;|An object.
events|Object&lt;`string`, [Event](#kind.event)&gt;|An object.

##### Example

```js
{
  "kind": "namespace",
  "entries": {
    "subspace": { /* entity */ }
  }
}
```

#### <a name="kind.function"></a> Function

> This entity extends from [Entity Base](#type) and accepts all its fields as well.

Field|Type|Description
---|---|---
kind|`const` `'function'`|**REQUIRED.** 
params|Array&lt;[Entity Tier 3](#entity-tier3)&gt;|**REQUIRED.** The parameters for this entity.
returns|[Entity Tier 3](#entity-tier3)|The return type from this entity.
this|[Entity Tier 3](#entity-tier3)|The value of `this`.
async|`boolean`|Indicates whether this function is asynchronous.
yields|Array&lt;[Entity Tier 3](#entity-tier3)&gt;|The entities this function yields.
emits|Array&lt;[Entity Base](#type)&gt;|The events this entity emits.
throws|Array&lt;[Entity Base](#type)&gt;|The errors this entity throws.
entries|Object&lt;`string`, [Entity Tier 3](#entity-tier3)&gt;|An object.
definitions|Object&lt;`string`, [Entity Tier 3](#entity-tier3)&gt;|An object.
events|Object&lt;`string`, [Event](#kind.event)&gt;|An object.

##### Example

```js
{
  "kind": "function",
  "params": [{
    "name": "first"
    "type": "string",
    "optional": true,
    "variable": true
  }],
  "returns": {
    "type": "Promise<number>"
  },
  "async": true
}
```

#### <a name="kind.class"></a> Class

> This entity extends from [Entity Base](#type) and accepts all its fields as well.

Field|Type|Description
---|---|---
kind|`const` `'class'`|**REQUIRED.** 
extends|Array&lt;[Entity Base](#type)&gt;|References to other entities this entity extends from.
implements|Array&lt;[Entity Base](#type)&gt;|References to other entities this entity implements.
constructor|[Constructor Object](#constructor)|
staticEntries|Object&lt;`string`, [Entity Tier 3](#entity-tier3)&gt;|An object.
entries|Object&lt;`string`, [Entity Tier 3](#entity-tier3)&gt;|An object.
definitions|Object&lt;`string`, [Entity Tier 2](#entity-tier2) \| [Entity Tier 3](#entity-tier3)&gt;|An object.
events|Object&lt;`string`, [Event](#kind.event)&gt;|An object.

##### Example

```js
{
  "kind": "class",
  "constructor": {
    "params": []
  },
  "staticEntries": {
    "fun": { /* entity */ }
  }
}
```

#### <a name="constructor"></a> Constructor Object

> This entity extends from [Entity Base](#type) and accepts all its fields as well.

Field|Type|Description
---|---|---
kind|`const` `'function'`|**REQUIRED.** 
params|Array&lt;[Entity Tier 3](#entity-tier3)&gt;|The parameters for this entity.

#### <a name="kind.interface"></a> Interface

> This entity extends from [Entity Base](#type) and accepts all its fields as well.

Field|Type|Description
---|---|---
kind|`const` `'interface'`|**REQUIRED.** 
params|Array&lt;[Entity Tier 3](#entity-tier3)&gt;|The parameters for this entity.
returns|[Entity Tier 3](#entity-tier3)|The return type from this entity.
this|[Entity Tier 3](#entity-tier3)|The value of `this`.
extends|Array&lt;[Entity Base](#type)&gt;|References to other entities this entity extends from.
implements|Array&lt;[Entity Base](#type)&gt;|References to other entities this entity implements.
entries|Object&lt;`string`, [Entity Tier 3](#entity-tier3)&gt;|An object.
definitions|Object&lt;`string`, [Entity Tier 2](#entity-tier2) \| [Entity Tier 3](#entity-tier3)&gt;|An object.
events|Object&lt;`string`, [Event](#kind.event)&gt;|An object.

##### Example

```js
{
  "kind": "interface",
  "entries": {
    "a": { /* entity */ }
  }
}
```

#### <a name="kind.event"></a> Event

> This entity extends from [Entity Base](#type) and accepts all its fields as well.

Field|Type|Description
---|---|---
kind|`const` `'event'`|**REQUIRED.** 
params|Array&lt;[Entity Tier 3](#entity-tier3)&gt;|The parameters for this entity.
returns|[Entity Tier 3](#entity-tier3)|The return type from this entity.
this|[Entity Tier 3](#entity-tier3)|The value of `this`.
entries|Object&lt;`string`, [Entity Tier 3](#entity-tier3)&gt;|An object.
definitions|Object&lt;`string`, [Entity Tier 3](#entity-tier3)&gt;|An object.

##### Example

```js
{
  "kind": "event",
  "params": []
}
```

#### <a name="kind.array"></a> Array

> This entity extends from [Entity Base](#type) and accepts all its fields as well.

Field|Type|Description
---|---|---
kind|`const` `'array'`|**REQUIRED.** 
items|Array&lt;[Entity Tier 3](#entity-tier3)&gt; \| [Entity Tier 3](#entity-tier3)|
definitions|Object&lt;`string`, [Entity Tier 3](#entity-tier3)&gt;|An object.

##### Example

```js
{
  "kind": "array",
  "items": { /* entity */ } // all values in array are of same type
}
```

```js
{
  "kind": "array",
  "items": [ {/* entity */ }, { /* entity */ }] // tuple
}
```

#### <a name="kind.union"></a> Union

> This entity extends from [Entity Base](#type) and accepts all its fields as well.

Field|Type|Description
---|---|---
kind|`const` `'union'`|**REQUIRED.** 
items|Array&lt;[Entity Tier 3](#entity-tier3)&gt;|
definitions|Object&lt;`string`, [Entity Tier 3](#entity-tier3)&gt;|An object.

##### Example

```js
{
  "kind": "union",
  "items": [{ /* entity */ }, { /* entity */ }]
}
```

