import { User } from "oidc-client";
import * as React from "react";
import { FC } from "react";
import { Header } from "./components/header";

interface ProfileProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Profile: FC<ProfileProps> = ({ user }) => {
  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <div className="App">
      <Header user={user} />
    </div>
  );
};
