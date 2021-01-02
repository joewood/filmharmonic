import { User } from 'oidc-client';
import * as React from 'react';
import { FC, useCallback, useEffect, useState } from 'react';
import { Header } from './header';
import { getMoviesFromVotes, MovieDetails, UserVote, voteAndRefresh } from './movies-api';

interface ProposalsProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Proposals: FC<ProposalsProps> = ({ user }) => {
  const [userProposals, setUserProposals] = useState<UserVote[]>([]);
  const [movies, setMovies] = useState<MovieDetails[]>([]);

  // this runs when `user` changes its value (e.g. when logged in). It uses the API to get all the users' proposals
  // and their movie details using the state hook variables above
  useEffect(() => {
    if (user)
      getMoviesFromVotes(user.access_token).then(([userProposals, movies]) => {
        setUserProposals(userProposals);
        setMovies(movies);
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
      <h1>{user?.profile?.name}</h1>
      <div style={{ display: 'grid', backgroundColor: 'rgba(255,255,255,0.5)' }}>
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
              <span>Proposed by: </span>
              {userProposals
                .filter((user) => user.proposed === movie.imdbID)
                .map((user) => user.name || user.RowKey)
                .join(', ')}
              <br />
              {/* If this movie is not my proposed movie then show a vote button, otherwise show a link to edit the proposal */}
              {myProposal?.proposed !== movie.imdbID ? (
                <button onClick={() => onVote(movie.imdbID)}>Vote</button>
              ) : (
                <a href="/search">Edit Proposal</a>
              )}
            </div>
            <div key={'Votes' + movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 5 }}>
              <span>Voted by: </span>
              {userProposals
                .filter((user) => user.vote === movie.imdbID)
                .map((user) => user.name || user.RowKey)
                .join(', ')}
            </div>
          </>
        ))}
      </div>
    </div>
  );
};
