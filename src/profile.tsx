import { User } from 'oidc-client';
import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { Header } from './header';
import { fetchMovie, fetchUser, MovieDetails } from './movies-api';

interface ProfileProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Profile: FC<ProfileProps> = ({ user }) => {
  const [proposed, setProposed] = useState<MovieDetails | null>(null);
  const [voted, setVoted] = useState<MovieDetails | null>(null);

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
    }
    request();
  }, [user]);
  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <div className="App">
      <Header user={user} />
      <h1>{user?.profile?.name}</h1>
      <a href="/search">Edit Proposal</a>
      <p>Proposed: {proposed?.Title}</p>
      <p>Vote: {voted?.Title}</p>
    </div>
  );
};
