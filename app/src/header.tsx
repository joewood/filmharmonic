import { navigate, useLocation } from "@reach/router";
import { User } from "oidc-client";
import { parse } from "query-string";
import * as React from "react";
import { FC, FormEventHandler, useRef } from "react";
import logo from "./images/Logo.png";

export const Header: FC<{ user: User | null }> = ({ user }) => {
  // in React the `useRef` function gives us a ref object that can be used to link to an HTML Element
  // this ref will link to the Search Input element below
  const searchRefInputElement = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { search } = parse(location.search) as { search: string };
  // When the user presses "Submit" we'll run the `onSubmit` function. This function won't submit
  // any values to the server. Instead it uses the value of the Search Input box to call the function
  // `searchMovies`. The value of the input bo is in the `.current.value` of the ref.
  const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    // preventDefault - stop the Form posting to the server
    event.preventDefault();
    navigate(`/search?search=${searchRefInputElement.current?.value || ""}`);
  };
  console.log(logo);
  return (
    <header>
      <div className="App-header">
        <a href="/">
          <img className="header-object logo" alt="logo" src={logo} />
        </a>
        <div className="user">
          <img className="header-object user-image" height={"32"} src={user?.profile.picture} alt="profile" />
          <a className="user user-name" href="/user">
            {user?.profile.name}
          </a>
        </div>

        <div className="search header-object">
          <form onSubmit={onSubmit} method="POST">
            <input
              className="searchbar"
              placeholder="Search.."
              ref={searchRefInputElement}
              name="search"
              defaultValue={search}
              type="text"
              spellCheck={false}
            />
            <input type="submit" value="🎥" />
          </form>
        </div>
      </div>
    </header>
  );
};
