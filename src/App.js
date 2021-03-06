import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';

import NavBar from './Components/NavBar';

import Home from './Screens/Home';
import Search from './Screens/Search';
import Admin from './Screens/Admin';
import Creator from './Screens/Creator';
import Profile from './Screens/Profile';
import View from './Screens/View';

export default function App() {
  return (
    <div className="w-full">
      <Route>
        <div className="w-screen">
          <NavBar />

          <Switch>
            <Route exact path="/">
              <Home />
            </Route>

            <Route exact path="/search/">
              <Search />
            </Route>

            <Route exact path="/search/:searchString">
              <Search />
            </Route>

            <Route exact path="/admin">
              <Admin />
            </Route>

            <Route exact path="/create">
              <Creator />
            </Route>

            <Route exact path="/edit/:id">
              <Creator />
            </Route>

            <Route exact path="/profile/:username">
              <Profile />
            </Route>

            <Route exact path="/view/:username/:slug">
              <View />
            </Route>

            <Route render={() => <Redirect to="/" />} />
          </Switch>
        </div>
      </Route>
    </div>
  );
}
