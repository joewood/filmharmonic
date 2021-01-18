import { User } from "oidc-client";
import * as React from "react";
import { FC } from "react";
import { Header } from "./header";
import { useUserMovies } from "./movies-api";
import { Wishlist } from "./wishlist-component";

interface ProfileProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Profile: FC<ProfileProps> = ({ user }) => {
  const { onRemoveWishlist, proposed, voted, wishlist } = useUserMovies(user);
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
      <Wishlist wishlist={wishlist} onRemove={onRemoveWishlist} />
    </div>
  );
};
