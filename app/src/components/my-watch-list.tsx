import { Flex } from "@chakra-ui/react";
import { User } from "oidc-client";
import * as React from "react";
import { FC } from "react";
import { useUserMovies } from "../movies-api";
import { MovieTile } from "./movie-tile";

export const MyWatchList: FC<{
  user: User | null;
  onRemove?: (imdbId: string) => void;
}> = ({ user, onRemove }) => {
  const { userMovies } = useUserMovies(user);
  return (
    <Flex
      flexWrap="wrap"
      m="1rem"
      mt="4rem"
      justifyContent="flex-start"
      ml="auto"
      mr="auto"
      maxWidth="min(1000px, 100vw)"
    >
      {userMovies?.wishlist.map((movie, index) => (
        <MovieTile key={movie.imdbID} movie={movie} />
      ))}
    </Flex>
  );
};
