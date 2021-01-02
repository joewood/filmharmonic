import { User } from 'oidc-client';
import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { fetchMovie, fetchUser, MovieDetails, UserState } from './movies-api';

interface ShowUserProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const ShowUser: FC<ShowUserProps> = ({ user }) => {
  const [userDetails, setUser] = useState<UserState | null>(null);
  const [proposed, setProposed] = useState<MovieDetails | null>(null);
  const [voted, setVoted] = useState<MovieDetails | null>(null);

  useEffect(() => {
    async function request() {
      if (!user?.profile?.email) return;
      const userDetails = await fetchUser(user?.access_token, user?.profile.email);
      console.log(userDetails);
      if (userDetails?.proposed) {
        const proposed = await fetchMovie(user.access_token, userDetails.proposed);
        setProposed(proposed);
      }
      if (userDetails?.vote) {
        const vote = await fetchMovie(user.access_token, userDetails.vote);
        setVoted(vote);
      }
      setUser(userDetails);
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
        <div className="user">{user?.profile.name}</div>
        <img width={100} src={user?.profile.picture} alt="profile" />
      </header>
      <h1>{user?.profile?.name}</h1>
      <p>Proposed: {proposed?.Title}</p>
      <p>Vote: {voted?.Title}</p>
      <p>Wishlist: {userDetails?.wishlist}</p>
    </div>
  );
};
