import { navigate, RouteComponentProps, Router } from '@reach/router';
import { UserManagerSettings } from 'oidc-client';
import * as React from 'react';
import { FC } from 'react';
import ReactDOM from 'react-dom';
import { Callback, makeAuthenticator, makeUserManager, UserData } from 'react-oidc';
import './index.css';
import { Search } from './search';

interface CBProps extends RouteComponentProps {}

const CB: FC<CBProps> = () => (
  <Callback
    onSuccess={(user) => {
      // `user.state` will reflect the state that was passed in via signinArgs.
      console.log('User', user);
      navigate('/');
    }}
    userManager={userManager}
  />
);

const userManagerConfig: UserManagerSettings = {
  client_id: '1006758276859-dtpr1lapbjv51g8cust93dac1qaiemav.apps.googleusercontent.com',
  response_type: 'id_token token',
  scope: 'openid email profile',
  authority: 'https://accounts.google.com',
  redirect_uri: 'http://localhost:3000/callback',
};
const userManager = makeUserManager(userManagerConfig);

const AuthorizedSearch: FC<RouteComponentProps> = () => (
  <UserData.Consumer>{(context) => <Search user={context.user} />}</UserData.Consumer>
);

const SearchWithAuth = makeAuthenticator({ userManager })(AuthorizedSearch);

const Root = () => (
  <React.StrictMode>
    <Router>
      <CB path="/callback" />
      <SearchWithAuth path="/" />
    </Router>
  </React.StrictMode>
);

ReactDOM.render(<Root />, document.getElementById('root'));
