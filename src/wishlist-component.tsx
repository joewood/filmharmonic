import * as React from "react";
import { FC } from "react";
import { MovieDetails, MovieDetailsWithWisher } from "./movies-api";
import pop from "./images/pop.jpg";

export const Wishlist: FC<{
  title?: string;
  wishlist: (MovieDetailsWithWisher | MovieDetails)[];
  onRemove?: (imdbId: string) => void;
}> = ({ title, wishlist, onRemove }) => (
  <div className="wishlist">
    <h2 className="wishlist-title" style={{ margin: "auto", maxWidth: "1000px", padding: 10 }}>
      {title || "Wishlist"}
    </h2>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "48px auto auto 1fr auto",
        gridAutoRows: "auto",
        gridRowGap: 20,
        gridColumnGap: 10,
        margin: "auto",
        maxWidth: "min(1000px, 100vw)",
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "space-between",
        padding: 10,
      }}
    >
      {wishlist.map((movie, index) => (
        <>
          <div key={movie.imdbID + "poster  "} style={{ fontWeight: "bold", gridRow: index + 1, gridColumn: 1 }}>
            <img src={!movie.Poster || movie.Poster === "N/A" ? pop : movie.Poster} width={"40px"} alt={movie.Title} />
          </div>
          <div key={movie.imdbID + "title"} style={{ gridRow: index + 1, gridColumn: 2 }}>
            <a
              style={{
                width: 200,
                fontWeight: "bold",
              }}
              href={`/movie/${movie.imdbID}`}
            >
              <div style={{ display: "block", whiteSpace: "pre-wrap" }}>{movie.Title}</div>
            </a>
            <div>{movie.Type}</div>
            <div>{movie.Released}</div>
            <div>{movie.Metascore !== "N/A" ? "Reviews: " + movie.Metascore + "%" : ""}</div>
          </div>
          <div key={movie.imdbID + "2"} style={{ gridRow: index + 1, fontSize: "0.75rem", gridColumn: 3 }}>
            <div>
              {movie.Genre.split(",").map((g) => (
                <div key={g}>{g}</div>
              ))}
            </div>
          </div>
          <div key={movie.imdbID + "3"} style={{ gridRow: index + 1, fontSize: "0.75rem", gridColumn: 4 }}>
            {movie.Actors.split(",").map((a) => (
              <div key={a}>{a}</div>
            ))}
          </div>
          <div key={movie.imdbID + "4"} style={{ gridRow: index + 1, fontSize: "0.75rem", gridColumn: 5 }}>
            {movie.Plot}
          </div>
          {!onRemove && "wishedBy" in movie && (
            <div key={movie.imdbID + "5"} style={{ gridRow: index + 1, gridColumn: 6 }}>
              {movie.wishedBy.length} {movie.wishedBy.length > 1 ? " Wishlists" : " Wishlist"}
            </div>
          )}
          {onRemove && (
            <div
              key={movie.imdbID + "5"}
              style={{ gridRow: index + 1, gridColumn: 6, padding: 5, alignSelf: "center", justifySelf: "start" }}
            >
              <button
                style={{ gridRow: index + 1, padding: 5, borderRadius: 5 }}
                onClick={() => onRemove(movie.imdbID)}
              >
                Remove
              </button>
            </div>
          )}
        </>
      ))}
    </div>
  </div>
);
