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
  entries: {
    ride: {
      kind: 'function',
      description: 'descr',
      params: [
        { type: 'string', name: 'to', description: 'afdfdfd fg d' },
        {
          type: 'object',
          name: 'coordinate',
          description: 'aweseomfe',
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
};

// describe('to markdown', () => {
//   describe('class', () => {
//     it('content', () => {
//       const m = toMarkdown(spec);
//       expect(m.content()).to.equal(`
// ### class: Bike

// Ride it!

// #### new Bike(color)

// - \`color\` <[string]>


// #### bike.ride(to)

// - \`to\` <[string]>

// `);
//     });
//   });
// });

const m = toMarkdown(spec);
// console.log(m.toc());
console.log(m.content());
// console.log(m.references());
