import { flatten } from 'lodash';
import { User } from 'oidc-client';
import * as React from 'react';
import { FC, useCallback, useEffect, useState } from 'react';
import { Header } from './header';
import { fetchMovie, getMoviesFromVotes, MovieDetails, UserVote, voteAndRefresh } from './movies-api';

interface ProposalsProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Proposals: FC<ProposalsProps> = ({ user }) => {
  const [userProposals, setUserProposals] = useState<UserVote[]>([]);
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [wishlist, setWishlist] = useState<MovieDetails[]>([]);

  // this runs when `user` changes its value (e.g. when logged in). It uses the API to get all the users' proposals
  // and their movie details using the state hook variables above
  useEffect(() => {
    if (user)
      getMoviesFromVotes(user.access_token).then(([userProposals, movies]) => {
        setUserProposals(userProposals);
        setMovies(movies);
        const wishes = flatten(userProposals.map((u) => (u.wishlist || '').split(','))).filter(
          (m) => !!m && m.length > 0
        );
        console.log('WISH', wishes);
        Promise.all(wishes.map((m) => fetchMovie(user.access_token, m)))
          .then(setWishlist)
          .catch(console.error);
      });
  }, [user]);

  // find the Proposal that belongs to the current logged in user (could use `useMemo` here)
  const myProposal = userProposals.find((proposal) => proposal.RowKey === user?.profile?.email);

  // Run when the user clicks "vote". Calls `voteAndRefresh` which returns the list of proposals. We use
  // the return value to update the state variable `userProposals`
  const onVote = useCallback(
    (imdbId: string) => {
      if (user) voteAndRefresh(user, imdbId).then(setUserProposals);
    },
    [user]
  );

  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <div className="App">
      <Header user={user} />
      <h1>Proposed Movies in Group: woods</h1>
      <div className="app-body" style={{ display: 'grid', backgroundColor: 'rgba(255,255,255,0.5)' }}>
        {movies.map((movie, index) => (
          <>
            <div key={'IMG' + movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 1 }}>
              <img height={150} src={movie.Poster} alt={movie.Title} />
            </div>
            <div key={movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 2 }}>
              <p style={{ fontWeight: 'bold' }}>{movie.Title}</p>
            </div>
            <div key={'Details' + movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 3 }}>
              <p>{movie.Year}</p>
              <p>{movie.Genre}</p>
              <p>{movie.Rated}</p>
              <p>Metacritic: {movie.Metascore}%</p>
            </div>
            <div key={'Proposed' + movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 4 }}>
              <p>Proposed by: </p>
              <ul>
                {userProposals
                  .filter((user) => user.proposed === movie.imdbID)
                  .map((user) => (
                    <li>{user.name || user.RowKey}</li>
                  ))}
              </ul>
              <br />
              {/* If this movie is not my proposed movie then show a vote button, otherwise show a link to edit the proposal */}
              {myProposal?.proposed !== movie.imdbID ? (
                <button onClick={() => onVote(movie.imdbID)}>Vote</button>
              ) : (
                <b>
                  <a href="/search">Change My Proposal</a>
                </b>
              )}
            </div>
            <div key={'Votes' + movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 5 }}>
              <p>Voted by: </p>
              <ul style={{ textAlign: 'left' }}>
                {userProposals
                  .filter((user) => user.vote === movie.imdbID)
                  .map((user) => (
                    <li>{`👍 ${user.name || user.RowKey}`}</li>
                  ))}
              </ul>
            </div>
          </>
        ))}
      </div>
      <h2>Wishlists from everyone in Woods</h2>
      {wishlist.map((movie) => (
        <div key={movie.imdbID} style={{ display: 'block', margin: 20 }}>
          <br />
          <img src={movie.Poster} width={80} alt={movie.Title} />
          <div style={{ display: 'inline-block', verticalAlign: 'middle', padding: 10, height: 50 }}>
            <a href={`/movie/${movie.imdbID}`}>{movie.Title}</a>
          </div>
        </div>
      ))}
    </div>
  );
};
