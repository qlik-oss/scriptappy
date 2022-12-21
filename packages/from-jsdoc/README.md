# @scriptappy/from-jsdoc

Generate a [Scriptappy](https://github.com/qlik-oss/scriptappy) definition from your JSDoc.

> Instructions on how to use `jsdoc` can be found on the [project's homepage](https://jsdoc.app/).

See [nodejs example](../../examples/nodejs)

## Install

```sh
npm install @scriptappy/from-jsdoc @scriptappy/cli
```

## Usage

### CLI

```
sy from-jsdoc

Options:
  --glob             Glob pattern for source files                                                               [array]
  -c, --config       Path to config file                                                        [string] [default: null]
  -p, --package      Path to package.json                                                                       [string]
  -x                 Output to stdout                                                         [boolean] [default: false]
  -o, --output.file  File to write to                                                                           [string]
  -w, --watch        Watch for file changes                                                   [boolean] [default: false]
  -h, --help         Show help                                                                                 [boolean]
  -v, --version      Show version number                                                                       [boolean]
```

Running `@scriptappy/from-jsdoc` without any arguments will use the default values.

```sh
npx @scriptappy/cli from-jsdoc
```

More options can be set through a config file:

```sh
npx @scriptappy/cli from-jsdoc -c path/to/config.js
```

### Configuration

```js
module.exports = {
  fromJsdoc: {
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
      sort: {
        alpha, // set to true to sort entries and definitions alphabetically
      },
      diffOnly: false, // set to true to write to file only when API has changed
      file: 'spec.json', // file to write to
    },
    jsdoc: /* object */, // jsdoc configuration object
    spec: {
      validate: true, // set to false to skip validation against schema, set to 'diff' to validate only when API has changed
    },
    parse: {
      tags: {
        include: undefined, // an array of white listed tags, e.g. ['committer']
        exclude: undefined, // an array of black-listed tags (not used if 'include' is an array), e.g. ['owner']
      },
      filter(doclet) { return true; },// filter out doclets
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
}
```

#### Rules

Parsing rules work a lot like [eslint rules](https://eslint.org/docs/rules/) and are meant to warn/error when weirds things are found in the jsdoc comments.

[More details on rules](./docs/rules.md).
