import { Box, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "@reach/router";
import * as React from "react";
import { FC } from "react";
import substituteImage from "../images/pop.jpg";
import { Movie } from "../movies-api";

export const MovieTile: FC<{ movie: Movie }> = ({ movie }) => (
  <Box key={movie.Title} mr={5} mb={5} h="14rem" overflow="hidden" position="relative" width="8rem">
    <Link as={RouterLink} to={`/movie/${movie.imdbID}`} textDecoration="none">
      <Box w="8rem" h="10rem" bg="gray.100" p={0} m={0}>
        <img
          src={!movie?.Poster || movie.Poster === "N/A" ? substituteImage : movie.Poster}
          alt={movie.Title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </Box>
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
      <Box color="black.100" lineHeight={1.1} w="8rem" h="4rem" pt="0.5rem">
        {movie.Title}
      </Box>
    </Link>
  </Box>
);
