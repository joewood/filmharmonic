import { StarIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading } from "@chakra-ui/react";
import { range } from "lodash";
import { User } from "oidc-client";
import * as React from "react";
import { FC } from "react";
import { MovieDetailsWithVotes, useGroupMovies } from "../movies-api";
import { MovieTile } from "./movie-tile";

const MovieWithVotes: FC<{ movie: MovieDetailsWithVotes; comingSoon?: boolean }> = ({ movie, comingSoon = false }) => (
  <Flex key={movie.imdbID} flexWrap="nowrap" justifyContent="space-between" opacity={comingSoon ? 0.75 : 1}>
    <Box flex="0 0 8rem">
      <MovieTile movie={movie} />
    </Box>
    <Box flex="1 1 auto" ml="1rem">
      <p>{movie.Actors}</p>
      <p>
        {!!movie.Rated && movie.Rated !== "N/A" && <b style={{ paddingRight: "0.5rem" }}>{movie.Rated}</b>}
        <span>{movie.Genre}</span>
      </p>
      {movie.Metascore !== "N/A" && (
        <p>
          <b>Metacritic:</b> {movie.Metascore}%
        </p>
      )}
      <p>
        <b>Release Date:</b> {movie.Released}
      </p>
      <Flex bg="gray.100" mt="0.5rem" p="3px" fontWeight="bold" justifyContent="space-between">
        <Box>
          {range(0, movie.votes - movie.watched).map((i) => (
            <StarIcon key={i} pr={1} />
          ))}
          {range(0, movie.watched).map((i) => (
            <StarIcon key={i} color="red.100" pr={1} />
          ))}
        </Box>
      </Flex>
    </Box>
  </Flex>
);

export const GroupWatchList: FC<{ group: string; user: User | null }> = ({ group, user }) => {
  const { wishlist } = useGroupMovies(user, group);
  const today = new Date().getTime();
  let [watchNow, comingSoon] = wishlist.reduce(
    ([wn, cs], c) => (new Date(c.Released || c.Year).getTime() < today ? [[...wn, c], cs] : [wn, [...cs, c]]),
    [[], []] as [MovieDetailsWithVotes[], MovieDetailsWithVotes[]]
  );
  comingSoon = comingSoon.sort(
    (a, b) => new Date(a.Released || a.Year).getTime() - new Date(b.Released || b.Year).getTime()
  );
  const watched = watchNow.filter((w) => w.votes === w.watched);
  watchNow = watchNow.filter((w) => w.votes !== w.watched);
  return (
    <Flex flexDirection="column">
      {watchNow.map((movie, i) => (
        <MovieWithVotes key={movie.imdbID + i} movie={movie} />
      ))}
      {comingSoon.length > 0 && <hr />}
      {comingSoon.length > 0 && <Heading pb="2rem">Coming Soon</Heading>}
      {comingSoon.map((movie, i) => (
        <MovieWithVotes key={movie.imdbID + i} movie={movie} comingSoon={true} />
      ))}
      {watched.length > 0 && <hr />}
      {watched.length > 0 && <Heading pb="2rem">Watched and Liked</Heading>}
      {watched.map((movie, i) => (
        <MovieWithVotes key={movie.imdbID + i} movie={movie} />
      ))}
    </Flex>
  );
};
