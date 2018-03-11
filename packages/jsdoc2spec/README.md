# jsdoc2spec

> Instructions on how to use `jsdoc` can be found on the [project's homepage](http://usejsdoc.org/).

Generate structured [API specification](https://github.com/miralemd/js-api-spec) from your jsdoc.

See [nodejs example](./examples/nodejs)

## Install

```sh
npm install jsdoc2spec
```

## Usage

### CLI

```
jsdoc2spec

Options:
  --glob             Glob pattern for source files                                                               [array]
  -c, --config       Path to config file                                                        [string] [default: null]
  -p, --package      Path to package.json                                                                       [string]
  -x                 Output to stdout                                                         [boolean] [default: false]
  -j, --jsdoc        Path to jsdoc-json file                                                                    [string]
  -o, --output.file  File to write to                                                                           [string]
  -w, --watch        Watch for file changes                                                   [boolean] [default: false]
  -h, --help         Show help                                                                                 [boolean]
  -v, --version      Show version number                                                                       [boolean]
```

Running `jsdoc2spec` without any arguments will use the default values.

```sh
npx jsdoc2spec
```

More options can be set through a config file:

```sh
npx jsdoc2spec -c path/to/config.js
```

### Configuration

```js
module.exports = {
  glob: ['./src/**/*.js'], // globby patterns to source files
  package: './package.json', // path to package.json
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
  jsdoc: /* string | object */, // location of jsdoc-json file, or a jsdoc configuration object
  spec: {
    validate: true, // set to false to skip validation against schema
  },
  parse: {
    tags: {
      include: undefined, // an array of white listed tags, e.g. ['committer']
      exclude: undefined, // an array of black-listed tags (not used if 'include' is an array), e.g. ['owner']
    },
    rules: {
      'no-unknown-types': 1,
      'no-missing-types': 1,
      'no-multi-return': 1,
      'no-unknown-stability': 2,
      'no-duplicate-references': 1,
      'no-untreated-kinds': 1,
      'no-default-exports-wo-name': 1,
      'no-unknown-promise': 1,
    }
  }
}
```

#### Rules

Parsing rules work a lot like [eslint rules](https://eslint.org/docs/rules/) and are meant to warn/error when weirds things are found in the jsdoc comments.

[More details on rules](./docs/rules.md).

### Generating specification from a JSDoc-JSON file

`jsdoc2spec` will by default create a jsdoc-json file on the fly using the specified `glob` pattern. If you already have a jsdoc-json file, you can pass that in in two ways:

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
