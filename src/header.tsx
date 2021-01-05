import { User } from 'oidc-client';
import * as React from 'react';
import { FC } from 'react';

export const Header: FC<{ user: User | null }> = ({ user }) => (
  <header className="App-header">
    <h1 className= "header-object">Film Harmonic</h1>
    <a className="user header-object" href="/user">
      {user?.profile.name}
    </a>
    <img className= "header-object" width={100} src={user?.profile.picture} alt="profile" />
  </header>
);
