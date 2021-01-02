import { navigate, RouteComponentProps, Router } from '@reach/router';
import { UserManagerSettings } from 'oidc-client';
import * as React from 'react';
import { FC } from 'react';
import ReactDOM from 'react-dom';
import { Callback, makeAuthenticator, makeUserManager, UserData } from 'react-oidc';
import './index.css';
import { ShowMovie } from './show-movie';
import { Search } from './search';
import { ShowUser } from './user';

interface CBProps extends RouteComponentProps {}

const CB: FC<CBProps> = () => <Callback onSuccess={(user) => navigate('/')} userManager={userManager} />;

const userManagerConfig: UserManagerSettings = {
  client_id: '1006758276859-dtpr1lapbjv51g8cust93dac1qaiemav.apps.googleusercontent.com',
  response_type: 'id_token token',
  scope: 'openid email profile',
  authority: 'https://accounts.google.com',
  redirect_uri: `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? ':' + window.location.port : ''
  }/callback`,
};
const userManager = makeUserManager(userManagerConfig);

const AuthorizedSearch: FC<RouteComponentProps> = () => (
  <UserData.Consumer>{(context) => <Search user={context.user} />}</UserData.Consumer>
);

const AuthorizedShowMovie: FC<RouteComponentProps<{ movieId: string }>> = ({ movieId }) => (
  <UserData.Consumer>{(context) => <ShowMovie user={context.user} movieId={movieId} />}</UserData.Consumer>
);

const AuthorizedShowUser: FC<RouteComponentProps> = () => (
  <UserData.Consumer>{(context) => <ShowUser user={context.user} />}</UserData.Consumer>
);

const SearchWithAuth = makeAuthenticator({ userManager })(AuthorizedSearch);
const MovieWithAuth = makeAuthenticator({ userManager })(AuthorizedShowMovie);
const UserWithAuth = makeAuthenticator({ userManager })(AuthorizedShowUser);

const Root = () => (
  <React.StrictMode>
    <Router>
      <CB path="/callback" />
      <SearchWithAuth path="/" />
      <MovieWithAuth path="/showmovie/:movieId" />
      <UserWithAuth path="/showuser" />
    </Router>
  </React.StrictMode>
);

ReactDOM.render(<Root />, document.getElementById('root'));
