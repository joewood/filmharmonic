import { uniq } from "lodash";
import { User } from "oidc-client";
import { useEffect, useState } from "react";

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

export interface MovieDetailsWithVotes extends MovieDetails {
  /** Who this movie was wished by */
  votes: number;
}

export interface Data {
  Search: Movie[];
}

export interface UserMovies {
  userid: string;
  groupid: string;
  proposed?: MovieDetails;
  vote?: MovieDetails;
  wishlist: MovieDetails[];
  name?: string;
}

async function fetchPut<T>(token: string, url: string): Promise<T | null> {
  console.log("PUT", url);
  const response = await fetch(url, {
    headers: { Authorization: "Bearer " + token },
    method: "PUT",
  });
  if (!response.ok) {
    console.error("Error URL PUT", url);
    return null;
  }
  return (await response.json()) as T;
}

async function fetchGet<T>(token: string, url: string): Promise<T> {
  const searchResponse = await fetch(url, {
    headers: { Authorization: "Bearer " + token },
  });
  return (await searchResponse.json()) as T;
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
  const searchResponse = await fetch("/api/group/woods", {
    headers: { Authorization: "Bearer " + token },
  });
  return (await searchResponse.json()) as UserMovies[];
}

export const addWish = (imdbMovie: string, wishlist: string[] | undefined) => uniq([imdbMovie, ...(wishlist || [])]);

export const removeWish = (imdbMovie: string, wishlist: string[] | undefined) =>
  (wishlist || []).filter((m) => m !== imdbMovie);

export async function updateWatchList(
  user: User,
  imdbId: string,
  addRemove: "add" | "remove" | "watched"
): Promise<UserMovies | null> {
  if (!user.profile?.email) throw new Error("No Email in profile");
  if (!user.access_token) throw new Error("Not Authenticated");
  const userDetails = await fetchPut<UserMovies>(
    user.access_token,
    `/api/user/${encodeURIComponent(user.profile.email)}/${addRemove}/${imdbId}`
  );
  return userDetails;
}

interface UseMoviesRet {
  /** call to remove movie from wishlist */
  // onRemoveWishlist: (imdbId: string) => void;
  userMovies: UserMovies | undefined;
  /** movie proposed by the user */
  // proposed: MovieDetails | null;
  /** movie voted for by the user */
  // voted: MovieDetails | null;
  /** wishlist of Movies  */
  // wishlist: MovieDetails[];
}

/** React Hook to manage the state of a user's proposed, vote and wishlist movies */
export function useUserMovies(user: User | null): UseMoviesRet {
  // const [proposed, setProposed] = useState<MovieDetails | null>(null);
  // const [voted, setVoted] = useState<MovieDetails | null>(null);
  const [userMovies, setUserMovies] = useState<UserMovies>();

  useEffect(() => {
    (async () => {
      if (!user?.profile?.email) return;
      const userDetails = await fetchGet<UserMovies>(
        user?.access_token,
        `/api/user/${encodeURIComponent(user?.profile?.email)}`
      );
      setUserMovies(userDetails);
      if (userDetails?.proposed) {
        // const proposed = await fetchMovie(user.access_token, userDetails.proposed);
        // setProposed(proposed);
      }
      if (userDetails?.vote) {
        // const vote = await fetchMovie(user.access_token, userDetails.vote);
        // setVoted(vote);
      }
      // const wishlist = await getMoviesFromWishlists(user, [userDetails]);
      // setWishlist(wishlist);
    })();
  }, [user]);
  /** Remove movie from wishlist */
  // const onRemoveWishlist = useCallback(
  //   (id: string) => {
  //     if (!user?.profile?.email) return;
  //     updateWatchList(user, id, "remove").then((o) => setUserMovies(o));
  //   },
  //   [user]
  // );
  return { userMovies };
}

interface GroupMovies {
  // userProposals: UserMovies[];
  // movies: MovieDetails[];
  wishlist: MovieDetailsWithVotes[];
  // onVote: (imdbId: string) => void;
  // myProposal: UserMovies | undefined;
}

/** React Hook to return all users movies in the group */
export function useGroupMovies(user: User | null, group: string): GroupMovies {
  const [wishlist, setWishlist] = useState<MovieDetailsWithVotes[]>([]);

  // this runs when `user` changes its value (e.g. when logged in). It uses the API to get all the users' proposals
  // and their movie details using the state hook variables above
  useEffect(() => {
    (async () => {
      if (!user) return [];
      try {
        const moviesWithVotes = await fetchGet<MovieDetailsWithVotes[]>(
          user.access_token,
          `/api/group/${group}/movies`
        );
        setWishlist(moviesWithVotes.sort((a, b) => b.votes - a.votes));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user, group]);

  // find the Proposal that belongs to the current logged in user (could use `useMemo` here)

  // Run when the user clicks "vote". Calls `voteAndRefresh` which returns the list of proposals. We use
  // the return value to update the state variable `userProposals`
  // const onVote = useCallback(
  //   (imdbId: string) => {
  //     if (user) voteAndRefresh(user, imdbId).then(setUserProposals);
  //   },
  //   [user]
  // );
  return { wishlist };
}
