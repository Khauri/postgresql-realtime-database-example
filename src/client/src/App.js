import React from 'react';
import {
  BrowserRouter as Router, 
  Route, 
  Switch
} from 'react-router-dom';
import Home from './pages/Home/Home';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path='/' >
            <Home />
          </Route>
          <Route>
            404: Not Found.
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
