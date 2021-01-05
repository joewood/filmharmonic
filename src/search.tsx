import { RouteComponentProps, navigate, useLocation } from '@reach/router';
import { User } from 'oidc-client';
import * as React from 'react';
import { FC, FormEventHandler, useEffect, useRef, useState } from 'react';
import { Header } from './header';
import { Movie, searchMovies } from './movies-api';

import { parse } from 'query-string';
// then
interface SearchProps extends RouteComponentProps {
  user: User | null;
}

/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Search: FC<SearchProps> = ({ user }) => {
  // in React the `useRef` function gives us a ref object that can be used to link to an HTML Element
  // this ref will link to the Search Input element below
  const searchRefInputElement = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const { search } = parse(location.search) as { search: string };

  // in React a Component can have state. These are special values that when they change will cause
  // the component to update (to re-render or redraw). The `useState` function returns an array where
  // the first element is the current state value, the second element in the array is the function to
  // change that value. We're using state to keep the list of Movies returned by the search
  const [movies, setMovies] = useState<Movie[]>([]);

  // When the user presses "Submit" we'll run the `onSubmit` function. This function won't submit
  // any values to the server. Instead it uses the value of the Search Input box to call the function
  // `searchMovies`. The value of the input bo is in the `.current.value` of the ref.
  const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    // preventDefault - stop the Form posting to the server
    event.preventDefault();
    navigate(`/search?search=${searchRefInputElement.current?.value || ''}`);
  };

  useEffect(() => {
    // if the ref is null clear the movie list
    if (search === null || search === '' || !user) setMovies([]);
    else {
      searchMovies(user.access_token, search).then((movies) => setMovies(movies.Search));
    }
  }, [search, user]);
  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <div className="App">
      <Header user={user} />
      <div className="search">
        <form onSubmit={onSubmit} method="POST">
          <label>
            Search
            <input className="searchbar" placeholder="Search.." ref={searchRefInputElement} name="search" type="text" spellCheck={false} />
          </label>
          <input type="submit" value="🎥" />
        </form>
      </div>
      <div className="con">
      <ul>
        {movies.map((movie) => (
          <div className="movie" key={movie.Title}>
            <a href={`/movie/${movie.imdbID}`}>
              <img src={movie.Poster} alt={movie.Title} width={100}></img>
              <p>{movie.Title}</p>
            </a>
          </div>
        ))}
      </ul>
      </div>
    </div>
  );
};
