import { Box, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "@reach/router";
import * as React from "react";
import { FC } from "react";
import substituteImage from "../images/pop.jpg";
import { Movie } from "../movies-api";

export const MovieTile: FC<{ movie: Movie }> = ({ movie }) => (
  <Box key={movie.Title} mr={5} mb={5} position="relative">
    <Link as={RouterLink} to={`/movie/${movie.imdbID}`} textDecoration="none">
      <Box height="10rem" width="7rem" boxShadow="#777 4px 4px 18px" padding="1px" background="#aaa">
        <div
          style={{
            width: "calc( 7rem - 2px )",
            height: "calc( 10rem - 2px )",
            overflow: "hidden",
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
          bg="rgba(255,255,255,0.7)"
        >
          {movie.Year}
        </Box>
      </Box>
      <Box
        color="black.100"
        lineHeight="1.2rem"
        w="calc( 8rem - 2px )"
        h="calc( 3.6rem + 8px )"
        pt="8px"
        style={{
          textOverflow: "ellipsis",
          overflow: "hidden",
          display: "box",
          lineClamp: 3,
          boxOrient: "vertical",
          whiteSpace: "normal",
        }}
        fontWeight="600"
        textAlign="center"
      >
        {movie.Title}
      </Box>
    </Link>
  </Box>
);
