import * as React from "react";
import { FC } from "react";
import { MovieDetails, MovieDetailsWithWisher } from "./movies-api";

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
        gridTemplateColumns: "auto auto auto 1fr auto",
        gridAutoRows: "auto",
        gridRowGap: 20,
        gridColumnGap: 10,
        margin: "auto",
        maxWidth: "1000px",
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "space-between",
        padding: 10,
      }}
    >
      {wishlist.map((movie, index) => (
        <>
          <div key={movie.imdbID + "1"} style={{ fontWeight: "bold", gridRow: index + 1, gridColumn: 1 }}>
            <a
              style={{
                maxWidth: 300,
                display: "block",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
              href={`/movie/${movie.imdbID}`}
            >
              {movie.Title}
            </a>
            <div>{movie.Type}</div>
            <div>{movie.Metascore !== "N/A" ? "Reviews: " + movie.Metascore + "%" : ""}</div>
          </div>
          <div key={movie.imdbID + "2"} style={{ gridRow: index + 1, gridColumn: 2 }}>
            <div>{movie.Released}</div>
            <div>
              {movie.Genre.split(",").map((g) => (
                <div key={g}>{g}</div>
              ))}
            </div>
          </div>
          <div key={movie.imdbID + "3"} style={{ gridRow: index + 1, gridColumn: 3 }}>
            {movie.Actors.split(",").map((a) => (
              <div key={a}>{a}</div>
            ))}
          </div>
          <div key={movie.imdbID + "4"} style={{ gridRow: index + 1, gridColumn: 4 }}>
            {movie.Plot}
          </div>
          {!onRemove && "wishedBy" in movie && (
            <div key={movie.imdbID + "5"} style={{ gridRow: index + 1, gridColumn: 5 }}>
              {movie.wishedBy.length} {movie.wishedBy.length > 1 ? " Wishlists" : " Wishlist"}
            </div>
          )}
          {onRemove && (
            <div
              key={movie.imdbID + "5"}
              style={{ gridRow: index + 1, gridColumn: 5, padding: 5, alignSelf: "center", justifySelf: "start" }}
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
