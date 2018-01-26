# Rules

During parsing of the jsdoc annotations, various rules can be enabled which can help detect issues in your documentation.

### `'no-unknown-types'`

Disallow unknown or unrecognized types. Useful in order to detect misspelling and undocumented types.

Examples of **incorrect** jsdoc for this rule:

```js
/**
 * @type {Prmise}
 */
```

Examples of **correct** jsdoc for this rule:

```js
/**
 * @type {string}
 */
```

### `'no-missing-types'`

Disallow missing types. Useful in order to detect missing annotations.

Examples of **incorrect** jsdoc for this rule:

```js
/**
 * @param x
 */
function(x) {}
```

Examples of **correct** jsdoc for this rule:

```js
/**
 * @param {number} x
 */
function(x) {}
```

### `'no-multe-return'`

Disallow multiple returns from a method.

Examples of **incorrect** jsdoc for this rule:

```js
/**
 * @returns {object} obj
 * @returns {string} obj.name
 */
```

Examples of **correct** jsdoc for this rule:

```js
/**
 * @returns {obj}
 */
```

### `'no-unknown-stability'`

Disallow unknown stability value.

During the development of an API, various endpoints and entities may evolve differently than the API. It is possible annotate the stability of an entity using `@stability <value>` or `@<value>`, where `<value>` is any of `experimental`, `stable`, `locked`.

Examples of **incorrect** jsdoc for this rule:

```js
/**
 * @stability 1
 */
```

Examples of **correct** jsdoc for this rule:

```js
/**
 * @stability stable
 */

/**
 * @experimental
 */

/**
 * @stable
 */

/**
 * @locked
 */
```

### `'no-duplicate-references'`

Disallow duplicate references.

References with the same global name will override each other and create weird endpoints.

Examples of **incorrect** jsdoc for this rule:

```js
//file-a.js
/**
 * @param {string} s
 */
function name(s) {}

//file-b.js
/**
 * @param {Person} p
 */
function name(p) {}
```

> Both methods have `name` as a global id and will override each other (depending on which file is read last).

The solution to this problem is to namespace the methods, or place them in modules.

Examples of **correct** jsdoc for this rule:

```js
//file-a.js
/**
 * @module a
 */

/**
 * @param {string} s
 */
function name(s) {}

//file-b.js

/**
 * @module b
 */
/**
 * @param {Person} p
 */
function name(p) {}
```

### `'no-untreated-kinds'`

Disallow untreated kinds.

Examples of **incorrect** jsdoc for this rule:

```js

```

Examples of **correct** jsdoc for this rule:

```js

```

### `'no-default-exports-wo-name'`

Defaults exports from files without a `@module` annotation will all receive a global id of `module.exports`, and thus override eachother.

Examples of **incorrect** jsdoc for this rule:

```js
/**
 * Fun
 */
export default function(){}
```

Examples of **correct** jsdoc for this rule:

```js
/**
 * Fun
 */
function fun(){}

export {
  fun as default
}
```
