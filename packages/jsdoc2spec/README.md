# jsdoc2spec

Generate structured [API specification](https://github.com/miralemd/js-api-spec) from your jsdoc.

See [nodejs example](./examples/nodejs/README.md)

## Install

```sh
npm install jsdoc jsdoc2spec
```

## Usage

### Generating specification

`jsdoc2spec` requires the `json`-formatted output from `jsdoc` as input, instructions on how to use `jsdoc` can be found on the [project's homepage](http://usejsdoc.org/).

The jsdoc-json input can be provided in two ways:

#### Pipe output from jsdoc to jsdoc2spec

```sh
npx jsdoc src -r -X | jsdoc2spec
```

`npx jsdoc src -r` generates documentation from files found in `./src` and its subfolders.

`-X` flag writes jsdoc-json to stdout, which is then piped to jsdoc2spec.

#### Use jsdoc2spec as template

```sh
npx jsdoc src -r -t jsdoc2spec
```

`-t`specifies `jsdoc2spec` as the output template for `jsdoc`.

### CLI

```sh
jsdoc2spec

Options:
  -c, --config       Path to config file  [string] [default: null]
  -x                 Output to stdout  [boolean] [default: false]
  -j, --jsdoc        Path to jsdoc-json file  [string]
  -o, --output.file  File to write to  [string]
  -h, --help         Show help  [boolean]
  -v, --version      Show version number  [boolean]
```

More options can be set through a config file.

### Configuration

```js
module.exports = {
  api: { // info about the generated API
    name: /* string */,
    description: /* string */,
    version: /* string */,
    license: /* string */,
    stability: /* 'experimental' | 'stable' | 'locked' */,
  },
  output: {
    file: 'spec.json', // file to write to
  },
  jsdoc: /* string */, // location of jsdoc-json file
  spec: {
    validate: true, // set to false to skip validation against schema
  },
  parse: {
    rules: {
      'no-unknown-types': 1,
      'no-missing-types': 1,
      'no-multi-return': 1,
      'no-unknown-stability': 2,
      'no-duplicate-references': 1,
      'no-untreated-kinds': 1,
      'no-default-exports-wo-name': 1,
    }
  }
}
```

#### Rules

Parsing rules work a lot like [eslint rules](https://eslint.org/docs/rules/) and are meant to warn/error when weirds things are found in the jsdoc comments.

[More details on rules](./docs/rules.md).

