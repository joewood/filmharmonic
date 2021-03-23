import { Container, CosmosClient } from "@azure/cosmos";
import { Context } from "@azure/functions";
import fetch from "node-fetch";
import { watch } from "node:fs";

/** one month in milliseconds */
const oneMonth = 1000 * 60 * 60 * 24 * 31;

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

export interface WatchListItem {
    moveid: string;
    userid: string;
    moviedetails: MovieDetails | undefined;
    movieupdated: string | undefined;
    watched?: boolean;
}

export type WatchListCorrectItem = Omit<WatchListItem, "moveid"> & { movieid: string };

export class HttpError extends Error {
    constructor(message: string, public status = 503) {
        super(message);
    }
}

export async function getMovie(id: string): Promise<MovieDetails> {
    const omdbRequest = await fetch(`http://www.omdbapi.com/?apikey=d88baf32&i=${id}`, { method: "GET" });
    if (omdbRequest.ok) {
        return await omdbRequest.json();
    } else {
        throw new HttpError(omdbRequest.statusText, omdbRequest.status);
    }
}

export async function getOrUpdateMovie(
    context: Context,
    container: Container | null,
    item: WatchListItem
): Promise<WatchListItem> {
    let { moveid, moviedetails, movieupdated, ...listItem } = item;
    try {
        if (!!moviedetails && !!movieupdated && new Date(movieupdated).getTime() + oneMonth > new Date().getTime()) {
            return item;
        }
    } catch (e) {
        context.log("Warning: " + e.message);
    }
    try {
        context.log("UPDATING");
        moviedetails = await getMovie(moveid);
        const watchListItem = {
            ...listItem,
            moveid,
            moviedetails,
            movieupdated: new Date().toISOString(),
        };
        if (!!container) await container.items.upsert(watchListItem);
        return watchListItem;
    } catch (e) {
        context.log("Error ", e.message);
        return item;
    }
}

export async function getUserWishlist(
    context: Context,
    wishlistContainer: Container,
    email: string
): Promise<Partial<MovieDetails>[]> {
    const wishlist = await wishlistContainer.items
        .query<WatchListItem>(`SELECT * from c WHERE c.userid="${email}"`)
        .fetchAll();
    const wishlistItems = wishlist.resources.filter((i) => !!i.moveid);
    const movies = await Promise.all(wishlistItems.map((item) => getOrUpdateMovie(context, wishlistContainer, item)));
    return movies.map(({ moveid, watched, moviedetails }) =>
        moviedetails ? { ...moviedetails, watched } : { imdbID: moveid }
    );
}

export async function getUser(container: Container, email: string) {
    const result = await container.items.query(`SELECT * FROM c WHERE c.userid="${email}"`).fetchAll();
    if (result.resources.length === 0) throw new HttpError(`User ${email} not found`, 404);
    const user = result.resources[0];
    return user;
}

export function getContainer(name: string): Container {
    const storageClient = new CosmosClient(process.env["COSMOS"]);
    const db = storageClient.database("filmharmonic");
    return db.container(name);
}
