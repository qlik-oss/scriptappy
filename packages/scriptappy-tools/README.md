# scriptappy-tools

Validation tool for [Scriptappy](https://github.com/miralemd/scriptappy).

## Install

```sh
npm install scriptappy-tools
```

## Usage

```js
const schema = require('scriptappy-schema');
const tools = require('scriptappy-tools');

const spec = { /* ... */ };

tools.validate(schema, spec);
```
