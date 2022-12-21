const toMarkdown = require('../lib/index');

const tClass = {
  kind: 'class',
  constructor: {
    kind: 'function',
    params: [{ type: 'string', name: 'color' }],
  },
  implements: ['Rideable'],
  extends: [{ type: 'Vehicle' }],
  description: 'Ride it!',
  staticEntries: {
    isBike: {
      kind: 'function',
      params: [],
      examples: ['sample'],
    },
  },
  entries: {
    ride: {
      kind: 'function',
      description: 'descr',
      params: [
        { type: 'string', name: 'to', description: 'param descr' },
        {
          type: 'object',
          name: 'coordinate',
          description: 'coord descr',
          variable: true,
          optional: true,
          entries: {
            x: { type: 'number', defaultValue: 'def' },
          },
        },
      ],
      returns: {
        type: 'boolean',
        nullable: true,
        description: 'true if successful',
      },
    },
  },
};

const spec = {
  entries: {
    Bike: tClass,
  },
  definitions: {
    t: {
      kind: 'object',
      entries: {
        b: {
          type: '#/entries/Bike',
        },
      },
    },
  },
};

const toc = `
- [class: Bike](#class-bike)
  - [new Bike(color)](#new-bikecolor)
  - [Bike.isBike()](#bikeisbike)
  - [bike.ride(to[, ...coordinate])](#bikerideto-coordinate)
- [object: t](#object-t)
`;

const content = `

### class: Bike

  - extends: <\`Vehicle\`>

Ride it!



#### new Bike(color)

- \`color\` <[string]>




#### Bike.isBike()

\`\`\`js
sample
\`\`\`



#### bike.ride(to[, ...coordinate])

- \`to\` <[string]> param descr
- \`...coordinate\` <...[Object]> coord descr
  - \`x\` <[number]> Defaults to \`def\`
- \`returns:\` <?[boolean]> true if successful


descr



### object: t

- \`b\` <[Bike]>
`;

const references = `
[Vehicle]: undefined
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[Bike]: #class-bike
`;

describe('to markdown', () => {
  describe('with defaults', () => {
    const m = toMarkdown(spec);

    it('toc', () => {
      expect(m.toc()).to.equal(toc);
    });

    it('content', () => {
      expect(m.content()).to.equal(content);
    });

    it('references', () => {
      expect(m.references()).to.equal(references);
    });
  });

  describe('with custom type', () => {
    const m = toMarkdown(spec, {
      type(t) {
        if (t === 'Vehicle') {
          return { url: 'garage' };
        }
        return undefined;
      },
    });

    it('references', () => {
      expect(m.references().split('\n')[1]).to.equal('[Vehicle]: garage');
    });
  });

  describe('with custom templates', () => {
    const m = toMarkdown(
      {
        entries: {
          Bike: {
            entries: {
              ride: {},
            },
          },
        },
      },
      {
        templates: {
          default: {
            pre: '#',
            indent: '>',
            label: (entry) => entry.name,
          },
        },
      }
    );

    it('should output custom content', () => {
      expect(m.content()).to.equal(`

# Bike



## ride

`);
    });

    it('should output custom toc', () => {
      expect(m.toc()).to.equal(`
- [Bike](#bike)
>- [ride](#ride)
`);
    });
  });
});
