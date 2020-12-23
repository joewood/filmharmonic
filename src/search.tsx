import * as React from 'react';
import { FormEventHandler, useRef, useState } from 'react';
import { Movie, searchMovies } from './movies-api';

/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export function Search() {
  // in React the `useRef` function gives us a ref object that can be used to link to an HTML Element
  // this ref will link to the Search Input element below
  const searchRefInputElement = useRef<HTMLInputElement>(null);

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
    // if the ref is null clear the movie list
    if (searchRefInputElement.current === null) setMovies([]);
    else {
      // if there's an input box then call `searchMovies` with the value
      const movies = await searchMovies(searchRefInputElement.current.value);
      // update the state of this component with the movies list
      setMovies(movies.Search);
    }
  };
  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <div className="App">
      <header className="App-header">
        <h1>Film Harmonic</h1>
      </header>
      <div className="search">
        <form onSubmit={onSubmit} method="POST">
          <label>
            Search
            <input ref={searchRefInputElement} name="search" type="text" spellCheck={false} />
          </label>
          <input type="submit" value="Search" />
        </form>
      </div>
      <ul>
        {movies.map((movie) => (
          <div className="movie" key={movie.Title}>
            <img src={movie.Poster} alt={movie.Title} width={100}></img>
          </div>
        ))}
      </ul>
    </div>
  );
}
