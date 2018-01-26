# JavaScript API Specification

> The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
[RFC 2119](https://tools.ietf.org/html/rfc2119).

## Table of Contents

- [Specification](#specification)
  - [Schema](#schema)
    - [Root Object](#root)
    - [Spec Object](#specObject)
    - [Info Object](#infoObject)
{{SCHEMA_TOC}}

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
spec | [Spec Object](#specObject) | **REQUIRED.**
info | [Info object](#infoObject) | **REQUIRED.** Metadata about the API.
entries | Map&lt;`string`, [Entity Object](#entityObject)&gt; | **REQUIRED.** An object holding the entry points available for the API.
definitions | Map&lt;`string`, [Entity Object](#entityObject)&gt; | Additional entities reachable through the entry points.

##### Example

```js
{
  spec: { /* spec object */ },
  info: { /* info object */ },
  entries: {
    getName: { /* entity object */ }
  },
  definitions: {
    Name: { /* entity object */ }
  }
}
```

#### <a name="specObject"></a> Spec Object

Field|Type|Description
---|---|---
version|`string`|**REQUIRED.**

##### Example

```js
{
  version: "1.0.0"
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

{{GENERATED}}