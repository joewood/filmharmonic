import { User } from 'oidc-client';
import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { fetchMovie, fetchUsers, MovieDetails, UserState } from './movies-api';

interface ProposalsProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Proposals: FC<ProposalsProps> = ({ user }) => {
  const [users, setUsers] = useState<UserState[]>([]);
  const [movies, setMovies] = useState<MovieDetails[]>([]);

  useEffect(() => {
    async function request() {
      if (!user?.profile?.email) return;
      const users = await fetchUsers(user?.access_token);
      setUsers(users);
      const movies = await Promise.all(
        users
          .map((u) => u.proposed)
          .filter((p) => !!p)
          .map((p) => fetchMovie(user.access_token, p!))
      );
      setMovies(movies);
    }
    request();
  }, [user]);

  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <div className="App">
      <header className="App-header">
        <h1>Film Harmonic</h1>
        <div className="user">{user?.profile.email}</div>
        <a className="user" href="/user">
          {user?.profile.name}
        </a>

        <img width={100} src={user?.profile.picture} alt="profile" />
      </header>
      <h1>{user?.profile?.name}</h1>
      <div style={{ display: 'grid' }}>
        {movies.map((u, n) => (
          <>
            <div key={'IMG' + u?.imdbID} style={{ gridRow: n + 1, gridColumn: 1 }}>
              <img height={150} src={u.Poster} alt={u.Title} />
            </div>
            <div key={u?.imdbID} style={{ gridRow: n + 1, gridColumn: 2 }}>
              <p style={{ fontWeight: 'bold' }}>{u.Title}</p>
            </div>
            <div key={'Details' + u?.imdbID} style={{ gridRow: n + 1, gridColumn: 3 }}>
              <p>{u.Year}</p>
              <p>{u.Genre}</p>
              <p>{u.Rated}</p>
              <p>Metacritic: {u.Metascore}%</p>
            </div>
            <div key={'Proposed' + u?.imdbID} style={{ gridRow: n + 1, gridColumn: 4 }}>
              <span>Proposed by: </span>
              {users
                .filter((uu) => uu.proposed === u.imdbID)
                .map((uu) => uu.RowKey)
                .join(', ')}
            </div>
            <div key={'Votes' + u?.imdbID} style={{ gridRow: n + 1, gridColumn: 5 }}>
              <span>Voted by: </span>
              {users
                .filter((uu) => uu.vote === u.imdbID)
                .map((uu) => uu.RowKey)
                .join(', ')}
              <button>Vote</button>
            </div>
          </>
        ))}
      </div>
    </div>
  );
};
