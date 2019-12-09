import express from 'express';
import path from 'path';
import api from './api';
import './ws';

const app = express();
const {
  NODE_ENV = 'development', 
  PORT = 5000
} = process.env;

// API route
app.use('/api', api);

// Serve the production build of the app
if(NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
