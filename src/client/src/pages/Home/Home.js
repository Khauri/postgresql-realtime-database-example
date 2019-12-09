import React, {useEffect} from 'react';

export default function HomePage() {
  useEffect(()=>{
    const ws = new WebSocket('ws://localhost:8080/');
    ws.addEventListener('open', () => {
      const message = {type:'subscribe', path: 'users', op: 'write'};
      ws.send(JSON.stringify(message));
      console.log('Socket Opened');
    });
    ws.addEventListener('message', ({data}) => {
      const message = JSON.parse(data);
      console.log(message);
    });
  }, [])
  return (
    <div>
      PostgreSql Realtime Database
    </div>
  )
}