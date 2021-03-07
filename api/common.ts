import { Container, CosmosClient } from "@azure/cosmos";

export class HttpError extends Error {
    constructor(message: string, public status = 503) {
        super(message);
    }
}

export async function getUser(container: Container, email: string) {
    const result = await container.items.query(`SELECT * FROM c WHERE c.userid="${email}"`).fetchAll();
    if (result.resources.length === 0) throw new HttpError(`User ${email} not found`, 404);
    const user = result.resources[0];
    const wishlistContainer = await getContainer("wishlist");
    const wishlist = await wishlistContainer.items.query(`SELECT c.moveid from c WHERE c.userid="${email}"`).fetchAll();
    user.wishlist = wishlist.resources?.map((m) => m.moveid) || [];
    return user;
}

export function getContainer(name: string): Container {
    const storageClient = new CosmosClient(process.env["COSMOS"]);
    const db = storageClient.database("filmharmonic");
    return db.container(name);
}
