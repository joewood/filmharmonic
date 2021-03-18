import { User } from "oidc-client";
import * as React from "react";
import { FC } from "react";
import { Header } from "./components/header";
import { MyWatchList } from "./components/my-watch-list";
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { GroupWatchlist } from "./components/group-watchlist";

interface ProposalsProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Proposals: FC<ProposalsProps> = ({ user }) => {
  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <Box>
      <Header user={user} />
      <Tabs isFitted isLazy variant="line" colorScheme="gray" marginTop={18} maxWidth="800px" ml="auto" mr="auto">
        <TabList position="sticky" top="4rem" left={0} background="white" zIndex="sticky">
          <Tab>My Watch List</Tab>
          <Tab>Woods Binge Group</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <MyWatchList user={user} />
          </TabPanel>
          <TabPanel>
            <GroupWatchlist user={user} group="woods" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};
