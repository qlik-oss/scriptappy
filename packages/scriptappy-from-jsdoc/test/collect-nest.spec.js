const collect = require('../src/collect-nest');

describe('collect params', () => {
  it('one', () => {
    const doc = {
      params: [
        {
          name: 'param name',
        },
      ],
    };
    const entity = sinon.stub();
    entity.withArgs(doc.params[0], 'cfg', 'opts').returns({ more: 'stuff' });
    const params = collect({ doc, list: doc.params, asArray: true }, 'cfg', 'opts', entity);

    expect(params).to.eql([
      {
        name: 'param name',
        more: 'stuff',
      },
    ]);
  });

  it('nested', () => {
    const doc = {
      params: [
        {
          name: 'options',
        },
        {
          name: 'options.model',
        },
      ],
    };
    const entity = sinon.stub();
    entity.withArgs(doc.params[0], 'cfg', 'opts').returns({ first: 'one' });
    entity.withArgs(doc.params[1], 'cfg', 'opts').returns({ second: 'one' });
    const params = collect({ doc, list: doc.params, asArray: true }, 'cfg', 'opts', entity);

    expect(params).to.eql([
      {
        name: 'options',
        kind: 'object',
        first: 'one',
        entries: {
          model: {
            second: 'one',
          },
        },
      },
    ]);
  });

  it('nested array', () => {
    const doc = {
      params: [
        {
          name: 'options',
        },
        {
          name: 'options[].model',
        },
      ],
    };
    const entity = sinon.stub();
    entity.withArgs(doc.params[0], 'cfg', 'opts').returns({ first: 'one' });
    entity.withArgs(doc.params[1], 'cfg', 'opts').returns({ second: 'one' });
    const params = collect({ doc, list: doc.params, asArray: true }, 'cfg', 'opts', entity);

    expect(params).to.eql([
      {
        name: 'options',
        first: 'one',
        kind: 'array',
        items: {
          kind: 'object',
          entries: {
            model: {
              second: 'one',
            },
          },
        },
      },
    ]);
  });
});

describe('collect props', () => {
  // const o = types.typedef({
  //   name: 'person',
  //   type: { names: ['object'] },
  //   properties: [
  //     {
  //       type: { names: ['object'] },
  //       name: 'first',
  //       nullable: true,
  //     },
  //     {
  //       type: { names: ['string'] },
  //       name: 'first.sub',
  //       optional: true,
  //     },
  //     {
  //       type: { names: ['object'] },
  //       name: 'first.obj',
  //     },
  //     {
  //       description: 'func',
  //       type: { names: ['function'] },
  //       name: 'get',
  //       optional: true,
  //     },
  //   ],
  //   longname: 'person',
  // });

  // expect(o).to.eql({
  //   kind: 'object',
  //   entries: {
  //     first: {
  //       nullable: true,
  //       kind: 'object',
  //       entries: {
  //         sub: {
  //           optional: true,
  //           type: 'string',
  //         },
  //         obj: {
  //           type: 'object',
  //         },
  //       },
  //     },
  //     get: {
  //       description: 'func',
  //       optional: true,
  //       type: 'function',
  //     },
  //   },
  // });
  it('nested array', () => {
    const doc = {
      properties: [
        {
          name: 'options',
        },
        {
          name: 'options[].model',
        },
      ],
    };
    const entity = sinon.stub();
    entity.withArgs(doc.properties[0], 'cfg', 'opts').returns({ first: 'one' });
    entity.withArgs(doc.properties[1], 'cfg', 'opts').returns({ second: 'one' });
    const props = collect({ doc, list: doc.properties }, 'cfg', 'opts', entity);

    expect(props).to.eql({
      options: {
        first: 'one',
        kind: 'array',
        items: {
          kind: 'object',
          entries: {
            model: {
              second: 'one',
            },
          },
        },
      },
    });
  });
});
