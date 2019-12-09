/**
 * A very Basic Websocket server that checks for a message
 * requesting a subscription. All requested subscriptions are
 * deleted when the socket is closed.
 */
import WebSocket from 'ws';
import * as db from './db';

const {WS_PORT = 8080} = process.env;

const wss = new WebSocket.Server({port: WS_PORT});

wss.on('listening', () => {
  console.log(`Websockets Listening on port ${WS_PORT}`);
})

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      message = JSON.parse(message);
    } catch (error) {
      console.error(error);
      const err = {
        status: 400,
        message: 'invalid message JSON'
      };
      ws.send(JSON.stringify(err));
      return;
    }
    // TODO check if the message is a subscription
    if(message.type !== 'subscribe'){
      return;
    }
    console.log('Adding Subscription', message);
    
    // TODO: check permissions to see if the client should be able 
    // to subscribe to this resource. 
    try {
      db.pubsub.subscribeRef(ws, message, (data) => {
        ws.send(JSON.stringify(data));
      });
    } catch(error) {
      console.error(error);
      const err = {
        status: 500,
        message: 'failed to create subscription'
      };
      ws.send(JSON.stringify(err));
    }
  });
  ws.on('close', () => {
    db.pubsub.unsubscribeRef(client);
  });
});

export default wss;