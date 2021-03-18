import { User } from "oidc-client";
import * as React from "react";
import { FC } from "react";
import { Header } from "./components/header";
import { useUserMovies } from "./movies-api";
import { MyWatchList } from "./components/my-watch-list";

interface ProfileProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Profile: FC<ProfileProps> = ({ user }) => {
  const { onRemoveWishlist, userMovies } = useUserMovies(user);
  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <div className="App">
      <Header user={user} />
      <div className="profilelayout">
        <h1>{user?.profile?.name}</h1>
        <a href="/search">Edit Proposal</a>
        <p>Proposed: {userMovies?.proposed?.Title}</p>
        <p>Vote: {userMovies?.vote?.Title}</p>
      </div>
      <MyWatchList user={user} onRemove={onRemoveWishlist} />
    </div>
  );
};
