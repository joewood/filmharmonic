import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { navigate, RouteComponentProps, useParams } from "@reach/router";
import { User } from "oidc-client";
import * as React from "react";
import { FC, memo, useCallback, useMemo } from "react";
import { GroupWatchList } from "./components/group-watch-list";
import { Header } from "./components/header";
import { MyWatchList } from "./components/my-watch-list";
import { useUser } from "./movies-api";

interface ProposalsProps extends RouteComponentProps {
  user: User | null;
}
/** In React a Function is like an HTML element, this is the <App> Component used in index.tsx */
export const Proposals: FC<ProposalsProps> = memo<ProposalsProps>(({ user }) => {
  const { group } = useParams();
  const userLogin = useUser(user);
  const onTabChange = useCallback(
    (tabIndex: number) => {
      navigate?.(tabIndex === 0 ? "/group/me" : `/group/${userLogin?.membership[tabIndex - 1].groupid}`);
    },
    [userLogin?.membership]
  );
  const tabIndex = useMemo(() => {
    if (!group || !userLogin || group === "me") return 0;
    return userLogin.membership.findIndex((m) => m.groupid === group) + 1;
  }, [group, userLogin]);
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
        index={tabIndex}
        onChange={onTabChange}
      >
        <TabList left={0} background="white" zIndex="sticky" position="sticky" top="4.7rem">
          <Tab index={0}>My Watch List</Tab>
          {userLogin?.membership?.map((g, i) => (
            <Tab key={g.groupid} index={i + 1}>
              Group: {g.groupid}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel>
            <MyWatchList user={user} />
          </TabPanel>
          {userLogin?.membership?.map((g, i) => (
            <TabPanel key={g.groupid}>
              <GroupWatchList user={user} group={g.groupid} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
});
