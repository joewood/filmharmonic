import { User } from 'oidc-client';
import * as React from 'react';
import { FC, useCallback, useEffect, useState } from 'react';
import { Header } from './header';
import { fetchMovie, fetchUser, MovieDetails, updateWishlist } from './movies-api';

interface ProfileProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Profile: FC<ProfileProps> = ({ user }) => {
  const [proposed, setProposed] = useState<MovieDetails | null>(null);
  const [voted, setVoted] = useState<MovieDetails | null>(null);
  const [wishlist, setWishlist] = useState<MovieDetails[]>([]);

  useEffect(() => {
    async function request() {
      if (!user?.profile?.email) return;
      const userDetails = await fetchUser(user?.access_token, user?.profile.email);
      if (userDetails?.proposed) {
        const proposed = await fetchMovie(user.access_token, userDetails.proposed);
        setProposed(proposed);
      }
      if (userDetails?.vote) {
        const vote = await fetchMovie(user.access_token, userDetails.vote);
        setVoted(vote);
      }
      if (userDetails?.wishlist) {
        console.log(userDetails?.wishlist);
        const movies = await Promise.all(
          userDetails?.wishlist
            .split(',')
            .filter((m) => m?.length)
            .map((m) => fetchMovie(user.access_token, m))
        );
        setWishlist(movies);
      }
    }
    request();
  }, [user]);

  const onRemove = useCallback(
    (id: string) => {
      if (!user?.profile?.email) return;
      updateWishlist(user, id, 'REMOVE').then((o) => setWishlist((wish) => wish.filter((f) => f.imdbID !== id)));
    },
    [user]
  );
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
        <h2>Wishlists from everyone in Woods</h2>
        {wishlist.map((movie) => (
          <div key={movie.imdbID}>
            <img src={movie.Poster} width={80} alt={movie.Title} />
            <div style={{ display: 'inline-block', verticalAlign: 'middle', padding: 10, height: 50 }}>
              <a href={`/movie/${movie.imdbID}`}>{movie.Title}</a>
            </div>
            <button onClick={() => onRemove}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};
