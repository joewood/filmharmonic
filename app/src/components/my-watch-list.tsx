import { Flex, Heading } from "@chakra-ui/react";
import { User } from "oidc-client";
import * as React from "react";
import { FC } from "react";
import { MovieDetails, useUserMovies } from "../movies-api";
import { MovieTile } from "./movie-tile";

type MD = MovieDetails & { watched?: boolean };

export const MyWatchList: FC<{
  user: User | null;
}> = ({ user }) => {
  const { userMovies } = useUserMovies(user);
  const today = new Date().getTime();
  let [watchNow, comingSoon] = userMovies?.wishlist?.reduce(
    ([wn, cs], c) => (new Date(c.Released || c.Year).getTime() < today ? [[...wn, c], cs] : [wn, [...cs, c]]),
    [[], []] as [MD[], MD[]]
  ) || [[], []];
  comingSoon = comingSoon.sort(
    (a, b) => new Date(a.Released || a.Year).getTime() - new Date(b.Released || b.Year).getTime()
  );
  const watched = watchNow.filter((w) => w.watched);
  watchNow = watchNow.filter((w) => !w.watched);
  return (
    <>
      <Flex flexWrap="wrap" mt="4rem" justifyContent="space-around" ml="auto" mr="auto" maxWidth="min(1000px, 100vw)">
        {watchNow.map((movie, i) => (
          <MovieTile key={movie.imdbID + i} movie={movie} />
        ))}
      </Flex>
      {comingSoon.length > 0 && <hr />}
      {comingSoon.length > 0 && <Heading pb="2rem">Coming Soon</Heading>}
      {comingSoon.length > 0 && (
        <Flex flexWrap="wrap" m="1rem" mt="4rem" justifyContent="space-around" ml="auto" mr="auto" maxWidth="800px">
          {comingSoon.map((movie, i) => (
            <MovieTile key={movie.imdbID + i} movie={movie} />
          ))}
        </Flex>
      )}
      {watched.length > 0 && <hr />}
      {watched.length > 0 && <Heading pb="2rem">Watched &amp; Liked</Heading>}
      {watched.length > 0 && (
        <Flex flexWrap="wrap" m="1rem" mt="4rem" justifyContent="space-around" ml="auto" mr="auto" maxWidth="800px">
          {watched.map((movie, i) => (
            <MovieTile key={movie.imdbID + i} movie={movie} />
          ))}
        </Flex>
      )}
    </>
  );
};
