import { User } from 'oidc-client';

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

export async function fetchUser(token: string, imdbId: string): Promise<UserVote> {
  const searchResponse = await fetch('/api/user/' + encodeURIComponent(imdbId), {
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

async function updateUserState(user: User, userState: UserVote): Promise<UserVote> {
  if (!user.profile?.email) throw new Error('No Email in profile');
  if (!user.access_token) throw new Error('Not Authenticated');
  const searchResponse = await fetch('/api/user/' + encodeURIComponent(user.profile.email), {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + user.access_token, 'Content-Type': 'application/json' },
    body: JSON.stringify(userState),
  });
  return await searchResponse.json();
}

export async function makeProposal(user: User, imdbId: string): Promise<UserVote> {
  if (!user.profile?.email) throw new Error('No Email in profile');
  if (!user.access_token) throw new Error('Not Authenticated');
  const searchResponse = await fetch('/api/user/' + encodeURIComponent(user.profile.email), {
    headers: { Authorization: 'Bearer ' + user.access_token },
  });
  const userDetails = (await searchResponse.json()) as UserVote;
  userDetails.proposed = imdbId;
  return await updateUserState(user, userDetails);
}

/** Update vote for the given user */
async function voteOnMovie(user: User, imdbId: string): Promise<UserVote> {
  if (!user.profile?.email) throw new Error('No Email in profile');
  if (!user.access_token) throw new Error('Not Authenticated');
  const searchResponse = await fetch('/api/user/' + encodeURIComponent(user.profile.email), {
    headers: { Authorization: 'Bearer ' + user.access_token },
  });
  const userDetails = (await searchResponse.json()) as UserVote;
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
