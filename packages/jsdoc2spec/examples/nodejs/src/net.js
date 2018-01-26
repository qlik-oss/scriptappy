/**
 * @module net
 * @stability stable
 */

/**
 * This class is used to create a TCP or ICP server
 */
export class Server {
  /**
   * Returns the bound address.
   * @returns {module:net.Server~address}
   */
  address() {}

  /**
   * Stops the server from accepting new connections and keeps existing connections
   */
  close() {}
}

/**
 * @typedef {object} module:net.Server~address
 * @property {number} port
 * @property {string} family
 * @property {string} address
 */

/**
 * Emitted when the server closes
 * @event module:net.Server.close
 */

/**
 * Emitted when a new connection is made.
 * @event module:net.Server.connect
 * @param {module:net.Socket} socket - The connection object
 */

/**
 * Creates a new TCP or ICP server.
 * @param {object} [options]
 * @param {boolean} [options.allowHalfOpen=false] - Indicates whether half-opened TCP connections are allowed.
 * @param {boolean} [options.pauseOnConnect=false] - Indicates whether the socket should be paused on incoming connections.
 * @param {function} [connectionsListener] - Automatically sets a listener for the `connection` event.
 * @returns {module:net.Server}
 */
export function createServer(options, connectionListener) {}
