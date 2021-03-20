import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { navigate, RouteComponentProps, useParams } from "@reach/router";
import { User } from "oidc-client";
import * as React from "react";
import { FC, useCallback } from "react";
import { GroupWatchList } from "./components/group-watch-list";
import { Header } from "./components/header";
import { MyWatchList } from "./components/my-watch-list";

interface ProposalsProps extends RouteComponentProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Proposals: FC<ProposalsProps> = ({ user }) => {
  const { group } = useParams();
  const onTabChange = useCallback((tabIndex: number) => {
    navigate(tabIndex === 0 ? "/" : "/group/woods");
  }, []);
  /** The React elements are the same as HTML other than `className` is used rather than `class`
   * and style looks a bit different. */
  return (
    <Box>
      <Header user={user} />
      <Tabs
        isFitted
        isLazy
        variant="line"
        colorScheme="gray"
        marginTop={18}
        maxWidth="800px"
        ml="auto"
        mr="auto"
        index={!group ? 0 : 1}
        onChange={onTabChange}
      >
        <TabList position="sticky" top="4rem" left={0} background="white" zIndex="sticky">
          <Tab index={0}>My Watch List</Tab>
          <Tab index={1}>Group: Woods</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <MyWatchList user={user} />
          </TabPanel>
          <TabPanel>
            <GroupWatchList user={user} group="woods" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};
