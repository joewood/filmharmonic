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

export interface UserState {
  RowKey: string;
  PartitionKey: string;
  proposed?: string;
  vote?: string;
  wishlist?: string;
}

/** Function that calls `fetch` calling the server to get the movies */
export async function searchMovies(token: string, search: string): Promise<Data> {
  const searchResponse = await fetch('/search/' + encodeURIComponent(search), {
    headers: { Authorization: 'Bearer ' + token },
  });
  return (await searchResponse.json()) as Data;
}

/** Function that calls `fetch` calling the server to get the movies */
export async function fetchMovie(token: string, id: string): Promise<MovieDetails> {
  const searchResponse = await fetch('/movie/' + id, {
    headers: { Authorization: 'Bearer ' + token },
  });
  return (await searchResponse.json()) as MovieDetails;
}

export async function fetchUser(token: string, id: string): Promise<UserState> {
  const searchResponse = await fetch('/user/' + encodeURIComponent(id), {
    headers: { Authorization: 'Bearer ' + token },
  });
  return (await searchResponse.json()) as UserState;
}

/** React Hook to search for a movie, returns a list of Movies */
// export function useSearchMovies(search: string): Movie[] {
//   const { isLoading, error, data } = useQuery<Data, string>({ queryFn: searchMovies, queryKey: ['search', search] });
//   if (isLoading) return [];
//   if (!!error) return [];
//   return data?.Search || [];
// }
