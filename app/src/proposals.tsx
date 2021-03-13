import { User } from "oidc-client";
import * as React from "react";
import { FC } from "react";
import { Header } from "./components/header";
import { useAllUsersMovies } from "./movies-api";
import { Wishlist } from "./components/wishlist-component";

interface ProposalsProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Proposals: FC<ProposalsProps> = ({ user }) => {
  const { movies, userProposals, wishlist, myProposal, onVote } = useAllUsersMovies(user);
  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <div className="App">
      <Header user={user} />
      <h1>Proposed Movies in Group: Woods</h1>
      <div className="app-body" style={{ display: "grid", backgroundColor: "rgba(255,255,255,0.5)" }}>
        {movies.map((movie, index) => (
          <>
            <div key={"IMG" + movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 1 }}>
              <img height={150} src={movie.Poster} alt={movie.Title} />
            </div>
            <div className="proposal-info">
              <div key={movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 2 }}>
                <p style={{ fontWeight: "bold" }}>{movie.Title}</p>
                <p>{movie.Actors}</p>
              </div>
              <div key={"Details" + movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 3 }}>
                <p>{movie.Year}</p>
                <p>{movie.Genre}</p>
                <p>{movie.Rated}</p>
                <p>Metacritic: {movie.Metascore}%</p>
              </div>
            </div>
            <div key={"Proposed" + movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 4 }}>
              <p>Proposed by: </p>
              <ul>
                {userProposals
                  .filter((user) => user.proposed === movie.imdbID)
                  .map((user) => (
                    <li>{user.name || user.userid}</li>
                  ))}
              </ul>
              <br />
              {/* If this movie is not my proposed movie then show a vote button, otherwise show a link to edit the proposal */}
              {myProposal?.proposed !== movie.imdbID ? (
                <button onClick={() => onVote(movie.imdbID)}>Vote</button>
              ) : (
                <b>
                  <a href="/search">Change My Proposal</a>
                </b>
              )}
            </div>
            <div key={"Votes" + movie?.imdbID} style={{ gridRow: index + 1, gridColumn: 5 }}>
              <p>Voted by: </p>
              <ul style={{ textAlign: "left" }}>
                {userProposals
                  .filter((user) => user.vote === movie.imdbID)
                  .map((user) => (
                    <li>{`👍 ${user.name || user.userid}`}</li>
                  ))}
              </ul>
            </div>
          </>
        ))}
      </div>
      <Wishlist wishlist={wishlist} title="Wishlist for Woods Group" />
    </div>
  );
};
