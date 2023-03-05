import express from 'express';

import { DB } from './db';

/** Zentrales Objekt für unsere Express-Applikation */
const app = express();

/** global instance of our database */
let db = new DB();

/** Initialize database connection */
async function initDB() {
    await db.connect();
    console.log("Connected to database");
}

// implement API routes
app.get('/todos', (req, res) => {
    let todos = db.queryAll();
    res.send(todos);
});

// Your code here
// Implement the following routes:
// GET /todos/:id
// POST /todos
// PUT /todos/:id
// DELETE /todos/:id


initDB()
    .then(() => {
        app.listen(3000, () => {
            console.log("Server listening on port 3000");
        })
    })

