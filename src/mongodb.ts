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
let petfaadilCollection = mongoClient.db('petfaadil').collection('petfaadil');

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