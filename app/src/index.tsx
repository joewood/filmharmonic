import { navigate, Redirect, RouteComponentProps, Router } from "@reach/router";
import { UserManagerSettings } from "oidc-client";
import * as React from "react";
import { FC, memo } from "react";
import ReactDOM from "react-dom";
import { Callback, makeAuthenticator, makeUserManager, UserData } from "react-oidc";
import { Movie } from "./movie";
import { Search } from "./search";
import { Profile } from "./profile";
import { Proposals } from "./proposals";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

interface CallbackProps extends RouteComponentProps {}
// 1. Using a style object
const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        margin: 0,
        color: "gray.600",
      },
      body: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans","Droid Sans", "Helvetica Neue", sans-serif',
        "-webkit-font-smoothing": "antialiased",
        "-moz-osx-font-smoothing": "grayscale",
        background: "radial-gradient(farthest-corner at 40px 40px, #fff 0%, #eff 100%)",
      },
      a: {
        color: "gray.700",
      },
    },
  },
});
const CallbackScreen: FC<CallbackProps> = () => (
  <Callback onSuccess={(user) => navigate("/")} userManager={userManager} />
);

const userManagerConfig: UserManagerSettings = {
  client_id: "1006758276859-dtpr1lapbjv51g8cust93dac1qaiemav.apps.googleusercontent.com",
  response_type: "id_token token",
  scope: "openid email profile",
  authority: "https://accounts.google.com",
  redirect_uri: `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? ":" + window.location.port : ""
  }/callback`,
};
const userManager = makeUserManager(userManagerConfig);
const authUser = makeAuthenticator({ userManager });

const SearchProposal = memo(
  authUser<RouteComponentProps>(() => (
    <UserData.Consumer>{(context) => <Search user={context.user} />}</UserData.Consumer>
  ))
);

const AuthMovie = memo(
  authUser<RouteComponentProps<{ movieId: string }>>(({ movieId }) => (
    <UserData.Consumer>{(context) => <Movie user={context.user} movieId={movieId} />}</UserData.Consumer>
  ))
);

const AuthProfile = authUser<RouteComponentProps>(() => (
  <UserData.Consumer>{(context) => <Profile user={context.user} />}</UserData.Consumer>
));

const AuthMain = memo(
  authUser<RouteComponentProps>((props) => (
    <UserData.Consumer>{(context) => <Proposals user={context.user} {...props} />}</UserData.Consumer>
  ))
);

const Root = memo(() => (
  <Router>
    <Redirect from="/" to="/group/me" noThrow />
    <CallbackScreen key="cb" path="/callback" />
    <AuthMain key="group" path="/group/:group" />
    <SearchProposal key="search" path="/search" />
    <AuthMovie key="movie" path="/movie/:movieId" />
    <AuthProfile key="prof" path="/user" />
  </Router>
));

const MainApp = memo<{}>(() => (
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Root />
    </ChakraProvider>
  </React.StrictMode>
));

ReactDOM.render(<MainApp />, document.getElementById("root"));
