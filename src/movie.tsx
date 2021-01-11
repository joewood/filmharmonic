import { navigate } from "@reach/router";
import { User } from "oidc-client";
import * as React from "react";
import { FC, useCallback, useEffect, useState } from "react";
import { Header } from "./header";
import pop from "./images/pop.jpg";
import { fetchMovie, makeProposal, MovieDetails, updateWishlist } from "./movies-api";

interface MovieProps {
  user: User | null;
  movieId: string | undefined;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Movie: FC<MovieProps> = ({ user, movieId }) => {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const onPropose = useCallback(() => {
    if (user && movieId) makeProposal(user, movieId).then(() => navigate("/"));
  }, [movieId, user]);
  const onWish = useCallback(() => {
    if (user && movieId) updateWishlist(user, movieId, "ADD").then(() => navigate("/user"));
  }, [movieId, user]);
  useEffect(() => {
    if (movieId && user) fetchMovie(user?.access_token, movieId).then(setMovie);
  }, [movieId, user]);

  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <div className="App">
      <Header user={user} />
      <div className="movieinfo">
        <h1>{movie?.Title}</h1>
        <button onClick={onPropose}>Make My Proposal</button>
        <button onClick={onWish}>Add to Wishlist</button>
        <p>{movie?.Plot}</p>
        <p>Year: {movie?.Year}</p>
        <p>Rated: {movie?.Rated}</p>
        <p>Box Office: {movie?.BoxOffice}</p>
        <p>Director: {movie?.Director}</p>
        <p>Metascore: {movie?.Metascore}</p>
        <img src={!movie?.Poster || movie.Poster === "N/A" ? pop : movie.Poster} alt="poster" width="200" />
      </div>
    </div>
  );
};
