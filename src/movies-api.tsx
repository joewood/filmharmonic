/**  Movie Search Results from the search */
export interface Movie {
  /** Poster URL image */
  Poster: string;
  /** TItle of the Movie */
  Title: string;
  /** Year that it was released */
  Year: string;
  /** imdbID code to use to get the movie details */
  imdbID: string;
}

export interface Data {
  Search: Movie[];
}

/** Function that calls `fetch` calling the server to get the movies */
export async function searchMovies(token: string, search: string): Promise<Data> {
  const searchResponse = await fetch('/search/' + encodeURIComponent(search), {
    headers: { Authorization: 'Bearer ' + token },
  });
  return (await searchResponse.json()) as Data;
}

/** Function that calls `fetch` calling the server to get the movies */
export async function fetchMovie(id: string): Promise<Data> {
  const searchResponse = await fetch('/movie/' + id);
  return (await searchResponse.json()) as Data;
}

/** React Hook to search for a movie, returns a list of Movies */
// export function useSearchMovies(search: string): Movie[] {
//   const { isLoading, error, data } = useQuery<Data, string>({ queryFn: searchMovies, queryKey: ['search', search] });
//   if (isLoading) return [];
//   if (!!error) return [];
//   return data?.Search || [];
// }
