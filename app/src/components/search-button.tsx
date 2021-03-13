import { SearchIcon } from "@chakra-ui/icons";
import { chakra, HStack, HTMLChakraProps, Kbd, VisuallyHidden, Text } from "@chakra-ui/react";
import * as React from "react";

export const SearchButton = React.forwardRef(function SearchButton(
  props: HTMLChakraProps<"button">,
  ref: React.Ref<HTMLButtonElement>
) {
  return (
    <chakra.button
      flex="1"
      type="button"
      role="search"
      mx="6"
      ref={ref}
      lineHeight="1.2"
      w="100%"
      bg={"gray.700"}
      whiteSpace="nowrap"
      display={{ base: "none", sm: "flex" }}
      alignItems="center"
      color="gray.400"
      py="3"
      px="4"
      outline="0"
      _focus={{ shadow: "outline" }}
      shadow="base"
      rounded="md"
      aria-label="Search the docs"
      {...props}
    >
      <SearchIcon />
      <HStack w="full" ml="3" spacing="4px">
        <Text textAlign="left" flex="1">
          Search Movies &amp; TV
        </Text>
      </HStack>
    </chakra.button>
  );
});
