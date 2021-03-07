import { flatten, groupBy, uniq } from "lodash";
import { User } from "oidc-client";
import { useCallback, useEffect, useState } from "react";

/**  Movie Search Results from the search */
export interface Movie {
  /** Poster URL image */
  Poster: string;
  /** TItle of the Movie */
  Title: string;
  Type: string;
  /** Year that it was released */
  Year: string;
  /** imdbID code to use to get the movie details */
  imdbID: string;
}

/**
 * API Stuff in this file - ignore
 */

interface Rating {
  Source: string;
  Value: string;
}

export interface MovieDetails {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Rating[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

export interface MovieDetailsWithWisher extends MovieDetails {
  /** Who this movie was wished by */
  wishedBy: string[];
}

export interface Data {
  Search: Movie[];
}

export interface UserMovies {
  RowKey: string;
  PartitionKey: string;
  proposed?: string;
  vote?: string;
  wishlist?: string;
  name?: string;
}

/** Function that calls `fetch` calling the server to get the movies */
export async function searchMovies(token: string, search: string, page: number): Promise<Data> {
  const searchResponse = await fetch(`/api/movie?search=${encodeURIComponent(search)}&page=${page}`, {
    headers: { Authorization: "Bearer " + token },
  });
  return (await searchResponse.json()) as Data;
}

/** Function that calls `fetch` calling the server to get the movies */
export async function fetchMovie(token: string, imdbId: string): Promise<MovieDetails> {
  const searchResponse = await fetch("/api/movie/" + imdbId, {
    headers: { Authorization: "Bearer " + token },
  });
  return (await searchResponse.json()) as MovieDetails;
}

export async function fetchUser(token: string, email: string): Promise<UserMovies> {
  const searchResponse = await fetch("/api/user/" + encodeURIComponent(email), {
    headers: { Authorization: "Bearer " + token },
  });
  return (await searchResponse.json()) as UserMovies;
}

export async function fetchUsers(token: string): Promise<UserMovies[]> {
  const searchResponse = await fetch("/api/group", {
    headers: { Authorization: "Bearer " + token },
  });
  return (await searchResponse.json()) as UserMovies[];
}

async function updateUserState(user: User, userVote: UserMovies): Promise<UserMovies> {
  if (!user.profile?.email) throw new Error("No Email in profile");
  if (!user.access_token) throw new Error("Not Authenticated");
  const searchResponse = await fetch("/api/user/" + encodeURIComponent(user.profile.email), {
    method: "PUT",
    headers: { Authorization: "Bearer " + user.access_token, "Content-Type": "application/json" },
    body: JSON.stringify(userVote),
  });
  return await searchResponse.json();
}

export async function makeProposal(user: User, imdbId: string): Promise<UserMovies> {
  if (!user.profile?.email) throw new Error("No Email in profile");
  if (!user.access_token) throw new Error("Not Authenticated");
  const userDetails = await fetchUser(user.access_token, user.profile.email);
  userDetails.proposed = imdbId;
  return await updateUserState(user, userDetails);
}

export const addWish = (imdbMovie: string, wishlist: string | undefined) =>
  uniq([imdbMovie, ...(wishlist || "").split(",")]).join(",");
export const removeWish = (imdbMovie: string, wishlist: string | undefined) =>
  (wishlist || "")
    .split(",")
    .filter((m) => m !== imdbMovie)
    .join(",");

export async function updateWishlist(user: User, imdbId: string, addRemove: "ADD" | "REMOVE"): Promise<UserMovies> {
  if (!user.profile?.email) throw new Error("No Email in profile");
  if (!user.access_token) throw new Error("Not Authenticated");
  const userDetails = await fetchUser(user.access_token, user.profile.email);
  userDetails.wishlist =
    addRemove === "ADD" ? addWish(imdbId, userDetails.wishlist) : removeWish(imdbId, userDetails.wishlist);
  return await updateUserState(user, userDetails);
}

/** Update vote for the given user */
async function voteOnMovie(user: User, imdbId: string): Promise<UserMovies> {
  if (!user.profile?.email) throw new Error("No Email in profile");
  if (!user.access_token) throw new Error("Not Authenticated");
  const userDetails = await fetchUser(user.access_token, user.profile.email);
  userDetails.vote = imdbId;
  userDetails.name = user.profile.name;
  return await updateUserState(user, userDetails);
}

/** Update vote for logged in user, return list of updated votes for all users */
export async function voteAndRefresh(user: User, imdbId: string): Promise<UserMovies[]> {
  if (!user.profile?.email) throw new Error("No Email in profile");
  if (!user.access_token) throw new Error("Not Authenticated");
  await voteOnMovie(user, imdbId);
  return await fetchUsers(user.access_token);
}

/** Return a tuple - a list of User Votes and their Proposed Movies */
export async function getMoviesFromVotes(token: string): Promise<[UserMovies[], MovieDetails[]]> {
  const users = await fetchUsers(token);
  const movies = await Promise.all(
    users
      .map((u) => u.proposed)
      .filter((p) => !!p)
      .map((p) => fetchMovie(token, p!))
  );
  return [users, movies];
}

export async function getMoviesFromWishlists(user: User, userMovies: UserMovies[]): Promise<MovieDetailsWithWisher[]> {
  const userMoviesId = flatten(
    userMovies.map((userMovie) =>
      (userMovie.wishlist || "")
        .split(",")
        .filter((m) => !!m && m.length > 0)
        .map((imdbId) => ({ user: userMovie.RowKey, imdbId }))
    )
  );
  const wishes = uniq(userMoviesId.map((u) => u.imdbId));
  const wishesByMovie = groupBy(userMoviesId, (m) => m.imdbId);
  const allMovies = await Promise.all(wishes.map((m) => fetchMovie(user.access_token, m)));
  return allMovies.map((a) => ({ ...a, wishedBy: wishesByMovie[a.imdbID]?.map((uu) => uu.user) ?? [] }));
}

interface UseMoviesRet {
  /** call to remove movie from wishlist */
  onRemoveWishlist: (imdbId: string) => void;
  /** movie proposed by the user */
  proposed: MovieDetails | null;
  /** movie voted for by the user */
  voted: MovieDetails | null;
  /** wishlist of Movies  */
  wishlist: MovieDetails[];
}

/** React Hook to manage the state of a user's proposed, vote and wishlist movies */
export function useUserMovies(user: User | null): UseMoviesRet {
  const [proposed, setProposed] = useState<MovieDetails | null>(null);
  const [voted, setVoted] = useState<MovieDetails | null>(null);
  const [wishlist, setWishlist] = useState<MovieDetails[]>([]);

  useEffect(() => {
    async function getUseMovies() {
      if (!user?.profile?.email) return;
      const userDetails = await fetchUser(user?.access_token, user?.profile.email);
      if (userDetails?.proposed) {
        const proposed = await fetchMovie(user.access_token, userDetails.proposed);
        setProposed(proposed);
      }
      if (userDetails?.vote) {
        const vote = await fetchMovie(user.access_token, userDetails.vote);
        setVoted(vote);
      }
      const wishlist = await getMoviesFromWishlists(user, [userDetails]);
      setWishlist(wishlist);
    }
    getUseMovies();
  }, [user]);
  /** Remove movie from wishlist */
  const onRemoveWishlist = useCallback(
    (id: string) => {
      if (!user?.profile?.email) return;
      updateWishlist(user, id, "REMOVE").then((o) => setWishlist((wish) => wish.filter((f) => f.imdbID !== id)));
    },
    [user]
  );
  return { onRemoveWishlist, proposed, voted, wishlist };
}

interface AllUsersMovies {
  userProposals: UserMovies[];
  movies: MovieDetails[];
  wishlist: MovieDetailsWithWisher[];
  onVote: (imdbId: string) => void;
  myProposal: UserMovies | undefined;
}

/** React Hook to return all users movies in the group */
export function useAllUsersMovies(user: User | null): AllUsersMovies {
  const [userProposals, setUserProposals] = useState<UserMovies[]>([]);
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [wishlist, setWishlist] = useState<MovieDetailsWithWisher[]>([]);

  // this runs when `user` changes its value (e.g. when logged in). It uses the API to get all the users' proposals
  // and their movie details using the state hook variables above
  useEffect(() => {
    async function getMovies(user: User) {
      try {
        const [userProposals, movies] = await getMoviesFromVotes(user.access_token);
        setUserProposals(userProposals);
        setMovies(movies);
        const wishlist = await getMoviesFromWishlists(user, userProposals);
        setWishlist(wishlist.sort((a, b) => b.wishedBy.length - a.wishedBy.length));
      } catch (e) {
        console.error(e);
      }
    }
    if (user) getMovies(user);
  }, [user]);

  // find the Proposal that belongs to the current logged in user (could use `useMemo` here)
  const myProposal = userProposals.find((proposal) => proposal.RowKey === user?.profile?.email);

  // Run when the user clicks "vote". Calls `voteAndRefresh` which returns the list of proposals. We use
  // the return value to update the state variable `userProposals`
  const onVote = useCallback(
    (imdbId: string) => {
      if (user) voteAndRefresh(user, imdbId).then(setUserProposals);
    },
    [user]
  );
  return { userProposals, movies, wishlist, onVote, myProposal };
}
