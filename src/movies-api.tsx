import { User } from 'oidc-client';
import { flatten, uniq } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

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

export interface Data {
  Search: Movie[];
}

export interface UserVote {
  RowKey: string;
  PartitionKey: string;
  proposed?: string;
  vote?: string;
  wishlist?: string;
  name?: string;
}

/** Function that calls `fetch` calling the server to get the movies */
export async function searchMovies(token: string, search: string): Promise<Data> {
  const searchResponse = await fetch('/api/search/' + encodeURIComponent(search), {
    headers: { Authorization: 'Bearer ' + token },
  });
  return (await searchResponse.json()) as Data;
}

/** Function that calls `fetch` calling the server to get the movies */
export async function fetchMovie(token: string, imdbId: string): Promise<MovieDetails> {
  const searchResponse = await fetch('/api/movie/' + imdbId, {
    headers: { Authorization: 'Bearer ' + token },
  });
  return (await searchResponse.json()) as MovieDetails;
}

export async function fetchUser(token: string, email: string): Promise<UserVote> {
  const searchResponse = await fetch('/api/user/' + encodeURIComponent(email), {
    headers: { Authorization: 'Bearer ' + token },
  });
  return (await searchResponse.json()) as UserVote;
}

export async function fetchUsers(token: string): Promise<UserVote[]> {
  const searchResponse = await fetch('/api/group', {
    headers: { Authorization: 'Bearer ' + token },
  });
  return (await searchResponse.json()) as UserVote[];
}

async function updateUserState(user: User, userVote: UserVote): Promise<UserVote> {
  if (!user.profile?.email) throw new Error('No Email in profile');
  if (!user.access_token) throw new Error('Not Authenticated');
  const searchResponse = await fetch('/api/user/' + encodeURIComponent(user.profile.email), {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + user.access_token, 'Content-Type': 'application/json' },
    body: JSON.stringify(userVote),
  });
  return await searchResponse.json();
}

export async function makeProposal(user: User, imdbId: string): Promise<UserVote> {
  if (!user.profile?.email) throw new Error('No Email in profile');
  if (!user.access_token) throw new Error('Not Authenticated');
  const userDetails = await fetchUser(user.access_token, user.profile.email);
  userDetails.proposed = imdbId;
  return await updateUserState(user, userDetails);
}

export const addWish = (imdbMovie: string, wishlist: string | undefined) =>
  uniq([imdbMovie, ...(wishlist || '').split(',')]).join(',');
export const removeWish = (imdbMovie: string, wishlist: string | undefined) =>
  (wishlist || '')
    .split(',')
    .filter((m) => m !== imdbMovie)
    .join(',');

export async function updateWishlist(user: User, imdbId: string, addRemove: 'ADD' | 'REMOVE'): Promise<UserVote> {
  if (!user.profile?.email) throw new Error('No Email in profile');
  if (!user.access_token) throw new Error('Not Authenticated');
  const userDetails = await fetchUser(user.access_token, user.profile.email);
  userDetails.wishlist =
    addRemove === 'ADD' ? addWish(imdbId, userDetails.wishlist) : removeWish(imdbId, userDetails.wishlist);
  return await updateUserState(user, userDetails);
}

/** Update vote for the given user */
async function voteOnMovie(user: User, imdbId: string): Promise<UserVote> {
  if (!user.profile?.email) throw new Error('No Email in profile');
  if (!user.access_token) throw new Error('Not Authenticated');
  const userDetails = await fetchUser(user.access_token, user.profile.email);
  userDetails.vote = imdbId;
  userDetails.name = user.profile.name;
  return await updateUserState(user, userDetails);
}

/** Update vote for logged in user, return list of updated votes for all users */
export async function voteAndRefresh(user: User, imdbId: string): Promise<UserVote[]> {
  if (!user.profile?.email) throw new Error('No Email in profile');
  if (!user.access_token) throw new Error('Not Authenticated');
  await voteOnMovie(user, imdbId);
  return await fetchUsers(user.access_token);
}

/** Return a tuple - a list of User Votes and their Proposed Movies */
export async function getMoviesFromVotes(token: string): Promise<[UserVote[], MovieDetails[]]> {
  const users = await fetchUsers(token);
  const movies = await Promise.all(
    users
      .map((u) => u.proposed)
      .filter((p) => !!p)
      .map((p) => fetchMovie(token, p!))
  );
  return [users, movies];
}

export async function getMoviesFromWishlists(user: User, votes: UserVote[]): Promise<MovieDetails[]> {
  const wishes = flatten(votes.map((u) => (u.wishlist || '').split(','))).filter((m) => !!m && m.length > 0);
  return await Promise.all(wishes.map((m) => fetchMovie(user.access_token, m)));
}

export function useProfileMovie(user: User | null) {
  const [proposed, setProposed] = useState<MovieDetails | null>(null);
  const [voted, setVoted] = useState<MovieDetails | null>(null);
  const [wishlist, setWishlist] = useState<MovieDetails[]>([]);

  useEffect(() => {
    async function request() {
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
    request();
  }, [user]);
  /** Remove movie from wishlist */
  const onRemoveWishlist = useCallback(
    (id: string) => {
      if (!user?.profile?.email) return;
      updateWishlist(user, id, 'REMOVE').then((o) => setWishlist((wish) => wish.filter((f) => f.imdbID !== id)));
    },
    [user]
  );
  return { onRemoveWishlist, proposed, voted, wishlist };
}

export function useProposalMovies(user: User | null) {
  const [userProposals, setUserProposals] = useState<UserVote[]>([]);
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [wishlist, setWishlist] = useState<MovieDetails[]>([]);

  // this runs when `user` changes its value (e.g. when logged in). It uses the API to get all the users' proposals
  // and their movie details using the state hook variables above
  useEffect(() => {
    if (user)
      getMoviesFromVotes(user.access_token).then(([userProposals, movies]) => {
        setUserProposals(userProposals);
        setMovies(movies);
        getMoviesFromWishlists(user, userProposals).then(setWishlist).catch(console.error);
      });
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
