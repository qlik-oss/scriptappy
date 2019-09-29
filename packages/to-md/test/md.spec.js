const toMarkdown = require('../lib/index');

const tClass = {
  kind: 'class',
  constructor: {
    kind: 'function',
    params: [{ type: 'string', name: 'color' }],
  },
  implements: ['Rideable'],
  extends: ['Vehicle'],
  description: 'Ride it!',
  staticEntries: {
    isBike: { kind: 'function', params: [] },
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
          entries: {
            x: { type: 'number' },
          },
        },
      ],
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
  - [bike.ride(to, coordinate)](#bikerideto-coordinate)
- [object: t](#object-t)
`;

const content = `

### class: Bike

Ride it!



#### new Bike(color)

- \`color\` <[string]>




#### Bike.isBike()



#### bike.ride(to, coordinate)

- \`to\` <[string]> param descr
- \`coordinate\` <[Object]> coord descr
  - \`x\` <[number]>


descr



### object: t

- \`b\` <[Bike]>
`;

const references = `
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[Bike]: #class-bike
`;


describe('to markdown', () => {
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
