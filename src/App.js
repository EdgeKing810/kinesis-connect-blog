import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';

import NavBar from './Components/NavBar';

import Admin from './Screens/Admin';
import Creator from './Screens/Creator';

const Home = () => {
  return null;
};

export default function App() {
  return (
    <div className="w-full">
      <Route>
        <div className="w-screen h-screen">
          <NavBar />

          <Switch>
            <Route exact path="/">
              <Home />
            </Route>

            <Route exact path="/create">
              <Creator />
            </Route>

            <Route exact path="/edit/:id">
              <Creator />
            </Route>

            <Route exact path="/admin">
              <Admin />
            </Route>

            <Route render={() => <Redirect to="/" />} />
          </Switch>
        </div>
      </Route>
    </div>
  );
}
