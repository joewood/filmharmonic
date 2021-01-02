import { navigate, RouteComponentProps, Router } from '@reach/router';
import { UserManagerSettings } from 'oidc-client';
import * as React from 'react';
import { FC } from 'react';
import ReactDOM from 'react-dom';
import { Callback, makeAuthenticator, makeUserManager, UserData } from 'react-oidc';
import './index.css';
import { Movie } from './movie';
import { Search } from './search';
import { Profile } from './profile';
import { Proposals } from './proposals';

interface CallbackProps extends RouteComponentProps {}

const CallbackScreen: FC<CallbackProps> = () => (
  <Callback onSuccess={(user) => navigate('/')} userManager={userManager} />
);

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
const authUser = makeAuthenticator({ userManager });

const SearchProposal = authUser<RouteComponentProps>(() => (
  <UserData.Consumer>{(context) => <Search user={context.user} />}</UserData.Consumer>
));

const AuthMovie = authUser<RouteComponentProps<{ movieId: string }>>(({ movieId }) => (
  <UserData.Consumer>{(context) => <Movie user={context.user} movieId={movieId} />}</UserData.Consumer>
));

const AuthProfile = authUser<RouteComponentProps>(() => (
  <UserData.Consumer>{(context) => <Profile user={context.user} />}</UserData.Consumer>
));

const AuthProposals = authUser<RouteComponentProps>(() => (
  <UserData.Consumer>{(context) => <Proposals user={context.user} />}</UserData.Consumer>
));

const Root = () => (
  <React.StrictMode>
    <Router>
      <CallbackScreen path="/callback" />
      <AuthProposals path="/" />
      <SearchProposal path="/search" />
      <AuthMovie path="/movie/:movieId" />
      <AuthProfile path="/user" />
    </Router>
  </React.StrictMode>
);

ReactDOM.render(<Root />, document.getElementById('root'));
