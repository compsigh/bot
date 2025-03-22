import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGO_URI;
if (!uri)
    throw new Error('Mongo URI environemnt variable is not defined');
const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect the client to the server
await mongoClient.connect();

// Send a ping to confirm a successful connection
await mongoClient.db('admin').command({ ping: 1 });
console.log('Connected to MongoDB');

// Collections
const petfaadilCollection = mongoClient.db('petfaadil').collection('petfaadil');
const workingonBans = mongoClient.db('workingon').collection('bans');

/** Updates the petcount in the database with petcount. */
export async function updatePetCount(petcount: number) {
    if (!petfaadilCollection)
        throw new Error('Failed to connect to database.')

    const filter = { docName: 'petcount' };
    const updateDoc = { $set: { petcount: petcount } };
    const options = { upsert: true };       // insert a document if doesn't exist

    await petfaadilCollection.updateOne(filter, updateDoc, options);
    console.log('Updated database with petcount: ' + petcount);
}

/** Returns the current petcount in the database. */
export async function getPetCount() {
    if (!petfaadilCollection)
        throw new Error('Failed to connect to database.')

    const filter = { docName: 'petcount' };
    const res = await petfaadilCollection.findOne(filter);
    if (res == null) {
        throw new Error();
    }
    return res.petcount;
}

/** Returns if the user with the given userId is banned from using the /workingon command. */
export async function isBanned(userId: string) {
    if (!workingonBans)
        throw new Error('Failed to connect to database.')

    const filter = { bannedUserId: userId };
    const res = await workingonBans.findOne(filter);

    return res != null;
}

/** Bans the user with bannedUserId from using the /workingon command. bannedByUserId is the userId of the user who did the ban. */
export async function addBan(bannedUserId: string, bannedByUserId: string) {
    if (!workingonBans)
        throw new Error('Failed to connect to database.')

    await workingonBans.insertOne({
        bannedUserId: bannedUserId,
        bannedByUserId: bannedByUserId
    });
}

/** Unbans the user with bannedUserId from using the /workingon command. */
export async function removeBan(userId: string) {
    if (!workingonBans)
        throw new Error('Failed to connect to database.')

    const filter = { bannedUserId: userId };
    await workingonBans.deleteOne(filter);
}