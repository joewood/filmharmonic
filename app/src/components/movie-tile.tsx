import { Box, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "@reach/router";
import * as React from "react";
import { FC } from "react";
import substituteImage from "../images/pop.jpg";
import { Movie } from "../movies-api";

export const MovieTile: FC<{ movie: Movie }> = ({ movie }) => (
  <Box key={movie.Title} mr={5} mb={5} h="14rem" overflow="hidden" position="relative" width="8rem">
    <Link as={RouterLink} to={`/movie/${movie.imdbID}`} textDecoration="none">
      <div
        style={{
          width: "8rem",
          height: "10rem",
          padding: 0,
          margin: 0,
          verticalAlign: "top",
          alignContent: "start",
          textAlign: "start",
        }}
      >
        <img
          src={!movie?.Poster || movie.Poster === "N/A" ? substituteImage : movie.Poster}
          alt={""}
          onError={(e: any) => (e.target.src = substituteImage)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
      <Box
        position="absolute"
        left={0}
        top={0}
        m={1}
        p={1}
        borderRadius={3}
        fontSize="0.8rem"
        fontWeight="bold"
        lineHeight={1}
        bg="rgba(255,255,255,0.5)"
      >
        {movie.Year}
      </Box>
      <Box color="black.100" lineHeight={1.1} w="8rem" h="4rem" pt="0.5rem" fontWeight="bold">
        {movie.Title}
      </Box>
    </Link>
  </Box>
);
