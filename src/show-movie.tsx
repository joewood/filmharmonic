import { User } from 'oidc-client';
import * as React from 'react';
import { FC, useCallback, useEffect, useState } from 'react';
import { fetchMovie, makeProposal, MovieDetails } from './movies-api';
import { navigate } from '@reach/router';

interface ShowMovieProps {
  user: User | null;
  movieId: string | undefined;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const ShowMovie: FC<ShowMovieProps> = ({ user, movieId }) => {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const onPropose = useCallback(() => {
    if (user?.access_token && user?.profile?.email && movieId)
      makeProposal(user?.access_token, user?.profile?.email, movieId).then(() => navigate('/'));
  }, [movieId, user?.access_token, user?.profile?.email]);
  useEffect(() => {
    if (movieId && user) fetchMovie(user?.access_token, movieId).then(setMovie);
  }, [movieId, user]);
  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <div className="App">
      <header className="App-header">
        <h1>Film Harmonic</h1>
        <div className="user">{user?.profile.email}</div>
        <div className="user">{user?.profile.name}</div>
        <img width={100} src={user?.profile.picture} alt="profile" />
      </header>
      <h1>{movie?.Title}</h1>
      <button onClick={onPropose}>Make My Proposal</button>

      <p>{movie?.Plot}</p>
      <p>Year: {movie?.Year}</p>
      <p>Rated: {movie?.Rated}</p>
      <p>Box Office: {movie?.BoxOffice}</p>
      <p>Director: {movie?.Director}</p>
      <p>Metascore: {movie?.Metascore}</p>
      <img src={movie?.Poster} alt="poster" width="200" />
    </div>
  );
};
