/**
 * It's important to use a client here (we only need one client)
 * as we need the client to never be released.
 */
const {Client} = require('pg');

/** @type {Client} */
let client;

module.exports = {
  /**
   * 
   * @param {import('pg').ClientConfig} config 
   */
  async init(config) {
    if(config && client) {
      await client.end();
      client = null;
    }
    if(!client) {
      client = new Client(config);
    }
    try {
      await client.connect();
    } catch(error) {
      console.warn(error);
      console.warn('Database operations will be offline');
      // try to reconnect in 10 seconds or so
      setTimeout(init, 10 * 1000);
    }
  },

  client() {
    if(!client) {
      console.warn('client has not been initialized');
    }
    return client;
  }
}