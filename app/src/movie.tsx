import { PlusSquareIcon, TimeIcon } from "@chakra-ui/icons";
import { Box, Button, Grid, Heading, Image, Spacer } from "@chakra-ui/react";
import { navigate } from "@reach/router";
import { User } from "oidc-client";
import * as React from "react";
import { FC, useCallback, useEffect, useState } from "react";
import { Header } from "./components/header";
import pop from "./images/pop.jpg";
import { fetchMovie, makeProposal, MovieDetails, updateWishlist } from "./movies-api";

interface MovieProps {
  user: User | null;
  movieId: string | undefined;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Movie: FC<MovieProps> = ({ user, movieId }) => {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const onPropose = useCallback(() => {
    if (user && movieId) makeProposal(user, movieId).then(() => navigate("/"));
  }, [movieId, user]);
  const onWish = useCallback(() => {
    if (user && movieId) updateWishlist(user, movieId, "ADD").then(() => navigate("/user"));
  }, [movieId, user]);
  useEffect(() => {
    if (movieId && user) fetchMovie(user?.access_token, movieId).then(setMovie);
  }, [movieId, user]);

  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <Box marginLeft={2} marginRight={2}>
      <Header user={user} />
      <Grid
        marginTop={18}
        maxWidth="800px"
        gridTemplateColumns="1fr 1fr"
        gridTemplateRows="auto auto 18rem 1fr"
        rowGap={4}
        ml="auto"
        mr="auto"
        columnGap={4}
        gridTemplateAreas={`"heading heading"
                            "propose watchList"
                            "poster info"
                            "plot plot" `}
      >
        <Heading gridArea="heading">{movie?.Title}</Heading>
        <Button gridArea="propose" justifySelf="stretch" onClick={onPropose} w="100%" leftIcon={<TimeIcon />}>
          Make My Proposal
        </Button>
        <Button gridArea="watchList" onClick={onWish} leftIcon={<PlusSquareIcon />}>
          Add to Watch List
        </Button>
        <Box gridArea="info" justifySelf="left">
          <p>
            <b>Year:</b> {movie?.Year}
          </p>
          <p>
            <b>Rated:</b> {movie?.Rated}
          </p>
          <p>
            <b>Box Office:</b> {movie?.BoxOffice}
          </p>
          <p>
            <b>Director:</b> {movie?.Director}
          </p>
          <p>
            <b>Metascore:</b> {movie?.Metascore}
          </p>
          <Spacer height={4} />
          <p>{movie?.Actors}</p>
        </Box>
        <Image
          justifySelf="center"
          gridArea="poster"
          src={!movie?.Poster || movie.Poster === "N/A" ? pop : movie.Poster}
          maxHeight="18rem"
          alt="poster"
          width="14rem"
        />
        <Box gridArea="plot">{movie?.Plot}</Box>
      </Grid>
    </Box>
  );
};
