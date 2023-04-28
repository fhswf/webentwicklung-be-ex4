import express from 'express';
import DB from './db.js'

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import { check, validationResult } from 'express-validator';
import cookieParser from 'cookie-parser';

// Passport.js JWT-Strategie
const opts = {
    jwtFromRequest: (req) => {
        let token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (!token) {
            if (req.cookies.token) {
                token = req.cookies.token
            }
        }
        console.log("token: %s", token)
        return token
    },
    secretOrKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyn2vP592Ju/iKXQW1DCrSTXyQXyo11Qed1SdzFWC+mRtdgioKibzYMBt2MfAJa6YoyrVNgOtGvK659MjHALtotPQGmis1VVvBeMFdfh+zyFJi8NPqgBTXz6bQfnu85dbxVAg95J+1Ud0m4IUXME1ElOyp1pi88+w0C6ErVcFCyEDS3uAajBY6vBIuPrlokbl6RDcvR9zX85s+R/s7JeP1XV/e8gbnYgZwxcn/6+7moHPDl4LqvVDKnDq9n4W6561s8zzw8EoAwwYXUC3ZPe2/3DcUCh+zTF2nOy8HiN808CzqLq1VeD13q9DgkAmBWFNSaXb6vK6RIQ9+zr2cwdXiwIDAQAB
-----END PUBLIC KEY-----`,
    ignoreExpiration: true,
    issuer: "https://jupiter.fh-swf.de/keycloak/realms/webentwicklung"
};

const TOKEN_URL = "https://jupiter.fh-swf.de/keycloak/realms/webentwicklung/protocol/openid-connect/token"


const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Todo API',
            version: '1.0.0',
            description: 'Todo API Dokumentation',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
        components: {
            schemas: {
                Todo: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            example: '6439519dadb77c080671a573',
                        },
                        title: {
                            type: 'string',
                            example: 'Für die Klausur Webentwicklung lernen',
                        },
                        due: {
                            type: 'string',
                            example: '2023-01-14T00:00:00.000Z',
                        },
                        status: {
                            type: 'integer',
                        },
                    },
                },
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            },
        },
        security: [{
            bearerAuth: []
        }],

    },
    apis: ['./index.js'],
};

const PORT = process.env.PORT || 3000;

/** Zentrales Objekt für unsere Express-Applikation */
const app = express();

app.use(cookieParser())
app.use(express.static('../frontend'));

/** Middleware für Swagger */
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
passport.use(
    new JwtStrategy(opts, (payload, done) => {
        // Hier können Sie zusätzliche Validierungen oder Benutzerabfragen durchführen, falls erforderlich
        console.log("JWT payload: %o", payload)
        return done(null, payload);
    })
);
app.use(passport.initialize());



/** global instance of our database */
let db = new DB();

/** Initialize database connection */
async function initDB() {
    await db.connect();
    console.log("Connected to database");
}


const todoValidationRules = [
    check('title')
        .notEmpty()
        .withMessage('Titel darf nicht leer sein')
        .isLength({ min: 3 })
        .withMessage('Titel muss mindestens 3 Zeichen lang sein'),
];

// implement API routes

/** Return all todos. 
 *  Be aware that the db methods return promises, so we need to use either `await` or `then` here! 
 * @swagger
 * /todos:
 *  get:
 *    summary: Gibt alle Todos zurück
 *    tags: [Todos]
 *    responses:
 *      '200':
 *        description: Eine Liste aller Todos
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Todo'
 */
app.get('/todos',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        let todos = await db.queryAll();
        res.send(todos);
    });

/** Endpoint for OpenID connect callback */
app.get('/oauth_callback', async (req, res) => {
    let code = req.query.code
    let state = req.query.session_state
    console.log("oauth_callback: code: %s, state: %s", code, state)
    let data = new URLSearchParams()
    data.append("client_id", "todo-backend")
    data.append("grant_type", "authorization_code")
    data.append("code", code)
    data.append("redirect_uri", "http://localhost:3000/oauth_callback")
    fetch(TOKEN_URL, {
        method: "POST",
        body: data
    })
        .then(response => {
            if (response.status != 200) {
                console.log("token endpoint faild with status %s, %j", response.status, response.body)
                res.sendStatus(response.status)
                throw (response)
            }
            else return response.json()
        })
        .then(response => {
            console.log("token endpoint: %j", response)
            let token = response.access_token
            res.cookie("token", token, { maxAge: 900000, httpOnly: true })
            res.setHeader("Location", "/todo.html")
            res.sendStatus(301)
        })
        .catch(err => {
            console.log("token endpoint failed: %j", err)
            if (!res.headersSent)
                res.sendStatus(500)
        })

})

//
// YOUR CODE HERE
//
// Implement the following routes:
// GET /todos/:id
// POST /todos
// PUT /todos/:id
// DELETE /todos/:id


initDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        })
    })

