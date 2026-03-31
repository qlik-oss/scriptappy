/* global jestExpect */
const toDts = require('../lib');

describe('to-dts integration', () => {
  const createSpec = ({ name = 'ActionToolbarElement', extendsList = [], templates = [] } = {}) => ({
    entries: {
      [name]: {
        kind: 'interface',
        extends: extendsList,
        templates,
        entries: {
          className: {
            value: "'njs-action-toolbar-popover'",
            kind: 'literal',
          },
        },
      },
    },
  });

  it('should emit interface with extends clause', () => {
    const spec = createSpec({
      extendsList: [{ type: 'HTMLElement' }],
    });

    const v = toDts(spec);

    jestExpect(v).toMatchSnapshot();
  });

  it('should emit interface with multiple extends clauses', () => {
    const spec = createSpec({
      extendsList: [{ type: 'HTMLElement' }, { type: 'EventTarget' }],
    });

    const v = toDts(spec);

    jestExpect(v).toMatchSnapshot();
  });

  it('should emit generic constraints with extends', () => {
    const spec = createSpec({
      name: 'GenericToolbarElement',
      templates: [{ name: 'T', type: 'HTMLElement' }],
    });

    const v = toDts(spec);

    jestExpect(v).toMatchSnapshot();
  });

  it('should emit both interface extends and generic constraint extends', () => {
    const spec = createSpec({
      name: 'ConstrainedToolbarElement',
      templates: [{ name: 'T', type: 'HTMLElement' }],
      extendsList: [{ type: 'BaseToolbar<T>' }],
    });

    const v = toDts(spec);

    jestExpect(v).toMatchSnapshot();
  });

  describe('class', () => {
    it('should emit class with constructor, extends and implements', () => {
      const spec = {
        entries: {
          EventEmitter: {
            kind: 'class',
            constructor: {
              params: [{ name: 'name', type: 'string' }],
            },
            extends: [{ type: 'BaseEmitter' }],
            implements: [{ type: 'Disposable' }],
            entries: {
              emit: {
                kind: 'function',
                params: [{ name: 'event', type: 'string' }],
                returns: { type: 'boolean' },
              },
            },
          },
        },
      };

      const v = toDts(spec);

      jestExpect(v).toMatchSnapshot();
    });
  });

  describe('config', () => {
    it('should emit umd namespace header', () => {
      const spec = {
        entries: {
          MyChart: {
            kind: 'interface',
            entries: {},
          },
        },
      };

      const v = toDts(spec, { umd: 'myChart' });

      jestExpect(v).toMatchSnapshot();
    });

    it('should emit disclaimer and triple-slash reference headers', () => {
      const spec = {
        entries: {
          MyLib: {
            kind: 'interface',
            entries: {},
          },
        },
      };

      const v = toDts(spec, { includeDisclaimer: true, dependencies: { references: ['qlik-engineapi'] } });

      jestExpect(v).toMatchSnapshot();
    });
  });

  describe('definitions', () => {
    it('should emit definitions as a namespace with cross-reference', () => {
      const spec = {
        entries: {
          createWidget: {
            kind: 'function',
            params: [{ name: 'options', type: '#/definitions/WidgetOptions' }],
            returns: { type: 'void' },
          },
        },
        definitions: {
          WidgetOptions: {
            kind: 'interface',
            entries: {
              width: { type: 'number' },
              height: { type: 'number' },
            },
          },
        },
      };

      const v = toDts(spec);

      jestExpect(v).toMatchSnapshot();
    });
  });
});
