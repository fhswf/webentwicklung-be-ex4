import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todos';
const MONGO_DB = process.env.MONGO_DB || 'todos';

let db = null;
let collection = null;
let client = null;

export default class DB {

    /** Connect to MongoDB and open client */
    connect() {
        return MongoClient.connect(MONGO_URI)
            .then(function (_client) {
                client = _client;
                db = client.db(MONGO_DB);
                collection = db.collection('todos');
            })
    }

    /** Close client connection to MongoDB */
    close() {
        return client.close()
    }

    // TODO: Implement methods for managing requirements
}