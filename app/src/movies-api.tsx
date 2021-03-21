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
export class HttpError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function fetchGet<T>(token: string, url: string): Promise<T | undefined> {
  const searchResponse = await fetch(url, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!searchResponse.ok) {
    throw new HttpError("fetchGet Failed: " + searchResponse.statusText, searchResponse.status);
  }
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
  userMovies: UserMovies | undefined;
}

/** React Hook to manage the state of a user's proposed, vote and wishlist movies */
export function useUserMovies(user: User | null): UseMoviesRet {
  const [userMovies, setUserMovies] = useState<UserMovies>();

  useEffect(() => {
    (async () => {
      if (!user?.profile?.email) return;
      try {
        const userDetails = await fetchGet<UserMovies>(
          user?.access_token,
          `/api/user/${encodeURIComponent(user?.profile?.email)}`
        );
        setUserMovies(userDetails);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user]);
  return { userMovies };
}

interface GroupMovies {
  wishlist: MovieDetailsWithVotes[];
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
        setWishlist(moviesWithVotes?.sort((a, b) => b.votes - a.votes) || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user, group]);

  return { wishlist };
}
