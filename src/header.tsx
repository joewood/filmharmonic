import { User } from 'oidc-client';
import * as React from 'react';
import { FC } from 'react';

export const Header: FC<{ user: User | null }> = ({ user }) => (
  <header className="App-header">
    <h1>Film Harmonic</h1>
    <a className="user" href="/user">
      {user?.profile.name}
    </a>
    <img width={100} src={user?.profile.picture} alt="profile" />
  </header>
);
