import { RouteComponentProps, useLocation } from "@reach/router";
import { User } from "oidc-client";
import { parse } from "query-string";
import * as React from "react";
import { FC, useEffect, useState } from "react";
import { Header } from "./components/header";
import { Movie, searchMovies } from "./movies-api";
import { MovieTile } from "./components/movie-tile";
import { Box } from "@chakra-ui/react";

// then
interface SearchProps extends RouteComponentProps {
  user: User | null;
}

/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Search: FC<SearchProps> = ({ user }) => {
  const location = useLocation();
  const { search, page } = parse(location.search) as { search: string; page: string };
  const numberPage = parseInt(page || "1");
  // in React a Component can have state. These are special values that when they change will cause
  // the component to update (to re-render or redraw). The `useState` function returns an array where
  // the first element is the current state value, the second element in the array is the function to
  // change that value. We're using state to keep the list of Movies returned by the search
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    // if the ref is null clear the movie list
    if (search === null || search === "" || !user) setMovies([]);
    else {
      searchMovies(user.access_token, search, numberPage).then((movies) => setMovies(movies.Search || []));
    }
  }, [search, numberPage, user]);
  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <div className="App">
      <Header user={user} />
      <Box display="flex" flexWrap="wrap" m="1rem" mt="4rem" justifyContent="flex-start">
        {movies.length === 0 && <p>No Results Found</p>}
        {movies.map((movie) => (
          <MovieTile movie={movie} />
        ))}
        <div className="movie" key="next">
          <a href={`/search?search=${search}&page=${numberPage + 1}`}>Next Page...</a>
        </div>
      </Box>
    </div>
  );
};
