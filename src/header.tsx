import { navigate, useLocation } from '@reach/router';
import { User } from 'oidc-client';
import { parse } from 'query-string';
import * as React from 'react';
import { FC, FormEventHandler, useRef } from 'react';

export const Header: FC<{ user: User | null }> = ({ user }) => {
  // in React the `useRef` function gives us a ref object that can be used to link to an HTML Element
  // this ref will link to the Search Input element below
  const searchRefInputElement = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { search } = parse(location.search) as { search: string };
  // When the user presses "Submit" we'll run the `onSubmit` function. This function won't submit
  // any values to the server. Instead it uses the value of the Search Input box to call the function
  // `searchMovies`. The value of the input bo is in the `.current.value` of the ref.
  const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    // preventDefault - stop the Form posting to the server
    event.preventDefault();
    navigate(`/search?search=${searchRefInputElement.current?.value || ''}`);
  };

  return (
    <header className="App-header">
      <h1 className="header-object">Film Harmonic</h1>
      <a className="user header-object" href="/user">
        {user?.profile.name}
      </a>

      <img className="header-object" width={100} src={user?.profile.picture} alt="profile" />

      <div className="search">
        <form onSubmit={onSubmit} method="POST">
          <input
            className="searchbar"
            placeholder="Search.."
            ref={searchRefInputElement}
            name="search"
            defaultValue={search}
            type="text"
            spellCheck={false}
          />
          <input type="submit" value="🎥" />
        </form>
      </div>
    </header>
  );
};
