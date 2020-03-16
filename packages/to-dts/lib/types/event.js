const dom = require('dts-dom');
const params = require('./params');

module.exports = function event(def, tsParent, g) {
  // TODO - register more event methods, e.g. 'once', removeListener etc
  const eventDef = {
    ...def,
    name: 'on',
    params: [{ name: 'event', kind: 'literal', value: `${def.name}` }],
    kind: 'function',
  };
  const eventType = g.getType(eventDef, tsParent);

  const listener = dom.create.functionType(params(def.params, false, g), dom.type.void);
  const listenerParemeter = dom.create.parameter('listener', listener);
  eventType.parameters.push(listenerParemeter);
  return eventType;
};
