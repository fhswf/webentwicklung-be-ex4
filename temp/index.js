import express from 'express';
import DB from './db.js'

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

/** global instance of our database */
let db = new DB();

/** Initialize database connection */
async function initDB() {
    await db.connect();
    console.log("Connected to database");
}

// TODO: Implement endpoints for managing requirements

let server;
initDB()
    .then(() => {
        server = app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        })
    })

export { app, server, db }