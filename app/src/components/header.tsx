import { SearchIcon } from "@chakra-ui/icons";
import { Box, Grid, Image, Input, InputGroup, InputRightElement, Link } from "@chakra-ui/react";
import { Link as RouterLink, navigate, useLocation } from "@reach/router";
import { User } from "oidc-client";
import { parse } from "query-string";
import * as React from "react";
import { FC, useRef } from "react";
import logo from "../images/Logo.png";

export const Header: FC<{ user: User | null }> = ({ user }) => {
  // in React the `useRef` function gives us a ref object that can be used to link to an HTML Element
  // this ref will link to the Search Input element below
  const searchRefInputElement = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { search } = parse(location.search) as { search: string };
  // When the user presses "Submit" we'll run the `onSubmit` function. This function won't submit
  // any values to the server. Instead it uses the value of the Search Input box to call the function
  // `searchMovies`. The value of the input bo is in the `.current.value` of the ref.
  return (
    <Grid
      as="header"
      w="100%"
      height="4rem"
      gridTemplate="auto / auto 1fr auto"
      alignItems="center"
      justifyItems="center"
      backgroundImage="linear-gradient(to bottom, rgba(255,255,255,1) 85%, rgba(255,255,255,0))"
      position="sticky"
      top={0}
      left={0}
    >
      <a href="/">
        <Image alt="logo" src={logo} height="2.5rem" />
      </a>
      <Box
        alignSelf="center"
        as="form"
        display="flex"
        alignItems="center"
        justifyContent="center"
        onSubmit={(event: any) => {
          event.preventDefault();
          navigate(`/search?search=${searchRefInputElement.current?.value}`);
          return false;
        }}
      >
        <InputGroup
          boxShadow="rgba(160,160,160,0.5) 5px 5px 22px"
          border="1px solid #e0e0e0"
          borderRadius={4}
          fontSize="1.6rem"
        >
          <Input
            padding={6}
            maxW="18rem"
            pr="1.5rem"
            fontSize="1.6rem"
            border="transparent"
            name="search"
            defaultValue={search}
            spellCheck={false}
            ref={searchRefInputElement}
            type="text"
            placeholder="Search Movies &amp; TV"
          />
          <InputRightElement color="#a0a0a0" padding="0.5rem" fontSize="1.6rem" children={<SearchIcon />} />
        </InputGroup>

        <input type="submit" style={{ visibility: "collapse" }} />
      </Box>
      <Box m={5} alignSelf="middle" display="flex" alignItems="center">
        <Image height="2.5rem" src={user?.profile.picture} alt="profile" borderRadius="50%" />
        <Link
          as={RouterLink}
          className="user user-name"
          to="/user"
          ml={4}
          visibility={["collapse", "collapse", "visible"]}
        >
          {user?.profile.name}
        </Link>
      </Box>
    </Grid>
  );
};
