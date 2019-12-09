
// The intent here is to automatically handle the updating of clients through websockets
// The websocket implementation is somewhat simple as there's no broadcasting involved
const EE = require('events');
const client = require('./client');

/**
 * Interface:
 * PgPS.createTriggers()
 */
module.exports = class PgPS extends EE {
  constructor(channel = 'events', ...args) {
    super(...args);
    this.channel = channel;
    this.setMaxListeners(Infinity);
    this.onChannelNotification = this.onChannelNotification.bind(this);
    this.clients = new Map();
  }
  /**
   * Initialize the PgPS
   * @param {import('pg').ClientConfig} config 
   */
  async init(config) {
    const {channel} = this;
    if(this.initialized) {
      return;
    }
    client.init(config)
    const cli = client.client();
    await cli.query(`LISTEN ${channel}`);
    cli.on('notification', this.onChannelNotification);
    this.initialized = true;
    return this;
  }

  onChannelNotification({payload}) {
    payload = JSON.parse(payload);
    const {op, table, curr, prev} = payload;
    const cloned = JSON.parse(JSON.stringify({curr, prev}));
    payload.data = () => JSON.parse(JSON.stringify(cloned.curr || cloned.prev));
    // emit op-event
    this.emit(`${op.toLowerCase()}-${table.toLowerCase()}`, payload);
    // emit write-event
    this.emit(`write-${table.toLowerCase()}`, {...payload, op: 'WRITE'});
  }

  createTriggerSql(table) {
    const {channel} = this;
    return (
      `
      CREATE OR REPLACE FUNCTION pg_pubsub_publish_change() RETURNS trigger AS $$
        DECLARE
          prev JSON;
          curr JSON;
          payload JSON;
        BEGIN
          IF (TG_OP = 'DELETE') THEN
            prev = row_to_json(OLD);
            curr = row_to_json(NULL);
          ELSIF (TG_OP = 'INSERT') THEN
            prev = row_to_json(NULL);
            curr = row_to_json(NEW);
          ELSE
            prev = row_to_json(OLD);
            curr = row_to_json(NEW);
          END IF;
        
          payload = json_build_object('table', TG_TABLE_NAME,
                                      'trigger', TG_NAME,
                                      'op', TG_OP,
                                      'prev', prev,
                                      'curr', curr);
  
          PERFORM pg_notify('${channel}', payload::text);
  
          RETURN NULL;
        END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS pg_pubsub_watch_${table}
        ON ${table};

      CREATE TRIGGER pg_pubsub_watch_${table}
        AFTER INSERT OR UPDATE OR DELETE
        ON ${table}
        FOR EACH ROW
        EXECUTE PROCEDURE pg_pubsub_publish_change();
      `
    );
  }

  /**
   * 
   * @param  {...string} tables 
   */
  async watchTables(...tables) {
    const cli = client.client();
    // flatten all sql into one string
    const query = tables.reduce((acc, next) => {
      return acc + this.createTriggerSql(next);
    }, '');
    await cli.query(query);
    return this;
  }

  /**
   * Subscribes a ref to some event listenerrs
   * @param {*} ref - Any persistable object such as a ws client or id string or etc
   * @param  {object} message - Message from client
   * @param {Function} callback - Callback function
   */
  subscribeRef(ref, ...args) {
    let subs = this.clients.get(ref);
    if(!subs) {
      subs = [];
      this.clients.set(ref, subs);
    }
    subs.push(this.subscribe(...args));
    return this;
  }

  unsubscribeRef(ref) {
    let subs = this.clients.get(ref);
    subs.forEach(unsub => unsub());
  }

  /**
   * @param {object} subOpts
   * @param {'INSERT'|'UPDATE'|'DELETE'|'TRUNCATE'|'WRITE'} subOpts.op 
   * @param {Function} cb 
   */
  subscribe({op, path}, cb) {
    const [table, col] = path.split('/');
    const eventStr = `${op.toLowerCase()}-${table.toLowerCase()}`
    const subFn = (payload) => {
      const {prev, curr} = payload;
      if(col && prev[col] === curr[col]) {
        return;
      }
      cb(payload);
    };
    this.on(eventStr, subFn);
    return () => {
      this.off(eventStr, subFn);
    }
  }
}
