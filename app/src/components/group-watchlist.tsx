import { CheckCircleIcon } from "@chakra-ui/icons";
import { Box, Flex } from "@chakra-ui/react";
import { User } from "oidc-client";
import * as React from "react";
import { FC } from "react";
import { useGroupMovies } from "../movies-api";
import { MovieTile } from "./movie-tile";

export const GroupWatchlist: FC<{ group: string; user: User | null }> = ({ group, user }) => {
  const { wishlist } = useGroupMovies(user, group);

  return (
    <Flex flexDirection="column">
      {wishlist.map((movie, index) => (
        <Flex key={movie.imdbID} flexWrap="nowrap" justifyContent="space-between">
          <MovieTile movie={movie} />
          <Box flex="1 1 auto" ml="3rem">
            <p>{movie.Actors}</p>
            <p>
              <b>{movie.Rated}</b>
              <span style={{ paddingLeft: "0.5rem" }}>{movie.Genre}</span>
            </p>
            <p>Metacritic: {movie.Metascore}%</p>
            <Flex bg="gray.100" mt="0.5rem" p="1.25rem" fontWeight="bold" justifyContent="space-between">
              <Box>Watched By: {movie.votes} members </Box>
              <CheckCircleIcon />
            </Flex>
          </Box>
        </Flex>
      ))}
    </Flex>
  );
};
