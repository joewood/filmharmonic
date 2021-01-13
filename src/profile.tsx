import { User } from 'oidc-client';
import * as React from 'react';
import { FC } from 'react';
import { Header } from './header';
import { useProfileMovie } from './movies-api';
import pop from './images/pop.jpg';

interface ProfileProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Profile: FC<ProfileProps> = ({ user }) => {
  const { onRemoveWishlist, proposed, voted, wishlist } = useProfileMovie(user);
  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <div className="App">
      <Header user={user} />
      <div className="profilelayout">
        <h1>{user?.profile?.name}</h1>
        <a href="/search">Edit Proposal</a>
        <p>Proposed: {proposed?.Title}</p>
        <p>Vote: {voted?.Title}</p>
      </div>
      <div className="wishlist">
        <h2>Wishlist</h2>
        <div className="app-body" style={{ display: 'grid', backgroundColor: 'rgba(255,255,255,0.5)' }}>
          {wishlist.map((movie, index) => (
            <>
              <div key={'IMG' + movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 1 }}>
                <img
                  height={150}
                  src={!movie?.Poster || movie.Poster === 'N/A' ? pop : movie.Poster}
                  alt={movie.Title}
                />
              </div>
              <div key={movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 2 }}>
                <p style={{ fontWeight: 'bold' }}>
                  <a href={`/movie/${movie.imdbID}`}>{movie.Title}</a>{' '}
                </p>
                <p>{movie.Actors}</p>
              </div>
              <div key={'Details' + movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 3 }}>
                <p>{movie.Year}</p>
                <p>{movie.Genre}</p>
                <p>{movie.Rated}</p>
                <p>Metacritic: {movie.Metascore}%</p>
              </div>
              <button
                style={{ gridRow: index + 1, gridColumn: 4, alignSelf: 'center', justifySelf: 'start' }}
                onClick={() => onRemoveWishlist(movie.imdbID)}
              >
                Remove
              </button>
            </>
          ))}
        </div>
      </div>
    </div>
  );
};
