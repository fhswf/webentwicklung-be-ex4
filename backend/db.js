import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todos';
const MONGO_DB = process.env.MONGO_DB || 'todos';

export default class DB {
    constructor() {
        this.client = null;
        this.db = null;
        this.collection = null;
    }

    /** Connect to MongoDB and open client */
    connect() {
        return MongoClient.connect(MONGO_URI)
            .then((_client) => {
                this.client = _client;
                this.db = this.client.db(MONGO_DB);
                this.collection = this.db.collection('todos');
            })
    }

    _ensureObjectId(id) {
        if (!ObjectId.isValid(id)) {
            throw new Error('InvalidObjectId');
        }
        return new ObjectId(id);
    }

    /** Close client connection to MongoDB */
    async close() {
        console.log('Closing MongoDB connection');
        if (this.client) {
            try {
                const client = this.client;
                this.client = null;
                this.db = null;
                this.collection = null;
                await client.close();
            } catch (err) {
                console.error('Error closing MongoDB client:', err);
            }
        }
    }

    /** Get all todos 
     * @returns {Promise} - Promise with all todos
     */
    queryAll() {
        return this.collection.find().toArray();
    }

    /** Get todo by id 
     * @param {string} id - id of todo to query
     * @returns {Promise} - Promise with todo
     */
    queryById(id) {
        let _id = this._ensureObjectId(id);
        return this.collection.findOne({ _id });
    }

    /** Update todo by id
     * @param {string} id - id of todo to update
     * @returns {Promise} - Promise with updated todo
     */
    update(id, todo) {
        let _id = this._ensureObjectId(id);
        todo._id = _id;
        return this.collection
            .replaceOne({ _id }, todo)
            .then(result => {
                if (result.modifiedCount === 1 || result.matchedCount === 1) {
                    return todo;
                }
                else {
                    console.log('Error updating todo: %o, %s', result, id);
                    throw new Error('Error updating todo');
                }
            })
            .catch(err => {
                console.log('Error updating todo: %o, %s', err, id);
                throw err;
            });
    }

    /** Delete todo by id
     * @param {string} id - id of todo to delete
     * @returns {Promise} - Promise with deleted todo
     */
    delete(id) {
        let _id = this._ensureObjectId(id);
        return this.collection.findOneAndDelete({ _id })
            .then(result => {
                if (result.ok) {
                    return result.value;
                }
                else {
                    console.log('Error deleting todo: %o, %s', result, id);
                    throw new Error('Error deleting todo');
                }
            })
    }

    /** Insert todo
     * @param {object} todo - todo to insert
     * @returns {Promise} - Promise with inserted todo
     */
    insert(todo) {
        return this.collection
            .insertOne(todo)
            .then(result => {
                if (result.acknowledged) {
                    todo._id = result.insertedId;
                    return todo;
                }
                else {
                    console.log('Error inserting todo: %o', result);
                    throw new Error('Error inserting todo');
                }
            });
    }
}
