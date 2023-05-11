# Automatisierte Tests für das Backend

In diesem Praktikum wollen wir automatisierte Tests für unser Backend erstellen. Dazu verwenden wir die Pakete
[Jest](https://jestjs.io/docs/getting-started) und [Supertest](https://github.com/visionmedia/supertest).

***Jest*** ist ein populäres Testframework für Javascript, das ursprünglich von *Meta*
entwickelt wurde. 
***Supertest*** ist ein Testframework speziell für das Testen von HTTP-Services. Die Besonderheit von Supertest ist, dass es sich selbst um das Starten des Servers kümmert (s.u.).

Da unsere Anwendung eine Autorisierung mit JWTs vorsieht, benötigen wir zusätzlich noch 
das Paket ***axios*** zum Ausführen von HTTP-Requests zu unserem Keycloak-Server.

## Aufgabe 1.1 Setup

Zunächst installieren Sie die notwendigen Pakete:

```
npm install --save-dev jest supertest axios
```

An der Anwendung müssen wir ein paar kleine Änderungen vornehmen, damit wir sie mit `supertest` und `jest` testen können. Supertest benötigt Zugriff auf das `app` 
Objekt und muss in der Lage sein, nach den Tests die Anwendung zu beenden. Dazu brauchen
wir Zugriff auf den gestarteten Server und die Datenbank. 
Ändern Sie dazu den Code am Ende der Datei `index.js` wie folgt ab:

```Javascript
let server;
initDB()
    .then(() => {
        server = app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        })
    })

export { app, server, db }
```

Damit die Datenbank gestoppt werden kann, ändern Sie den Anfang der Datei `db.js` wie folgt ab:

```Javascript
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
```

Als Nächstes erstellen Sie eine neue Datei `todo.test.js`, in der Sie Ihre Tests schreiben.

Jetzt können wir damit beginnen, einige Testfälle für Ihre Todo-Application zu erstellen. 

Als erstes fügen wir einen Testfall hinzu, der prüft, ob unautorisierte Anfragen abgelehnt werden. Dazu versucht er, eine geschützte Route ohne den Authorization-Header aufzurufen:

```javascript
import request from 'supertest';
import app from './index';

describe('GET /todos (unautorisiert)', () => {
  it('sollte einen 401-Fehler zurückgeben, wenn kein Token bereitgestellt wird', async () => {
    const response = await request(app).get('/todos'); // Kein Authorization-Header

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });
});

afterAll(async () => {
    server.close()
    db.close()
})
```


Um die Tests auszuführen, fügen wir in der `package.json` unter "scripts" den folgenden Eintrag hinzu:

```json
"scripts": {
  "test": "NODE_OPTIONS=--experimental-vm-modules npx jest"
}
```

> **Bemerkung**: Die Option `--experimental-vm-modules` ist notwendig, da Jest aktuell 
> noch keine offizielle Unterstützung für ES6 Module anbietet, 
> s. [github.com/jestjs/jest/issues/9430](https://github.com/jestjs/jest/issues/9430)


Anschließend können Sie Ihre Tests mit `npm test` ausführen:
```Bash
node ➜ /workspaces/webentwicklung-be-ex4/backend (testing) $ npm test

> todo-backend@1.0.0 test
> NODE_OPTIONS=--experimental-vm-modules npx jest
 PASS  ./todo.test.js
  GET /todos (unautorisiert)
    ✓ sollte einen 401-Fehler zurückgeben, wenn kein Token bereitgestellt wird (53 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.62 s, estimated 2 s
Ran all test suites.
```


## Aufgabe 1.2: Autorisierung per JWT

Um die Autorisierung in Ihren Tests zu berücksichtigen, müssen Sie zuerst einen gültigen JWT-Token für Ihren Testbenutzer "public" abrufen. Hier ist, wie man das macht:


1. Erstellen Sie eine Hilfsfunktion, um den Token für Ihren Testbenutzer abzurufen. Erstellen Sie eine Datei namens `utils.js` und fügen Sie den folgenden Code hinzu:

```javascript
import axios from 'axios';

async function getKeycloakToken() {
  const keycloakConfig = {
    baseUrl: 'https://jupiter.fh-swf.de/keycloak',
    realm: 'webentwicklung',
    clientId: 'todo-backend',
  };

  const tokenEndpoint = `${keycloakConfig.baseUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;

    try {
        const response = await axios.post(tokenEndpoint,
            {
                'grant_type': 'password',
                'client_id': keycloakConfig.clientId,
                'username': 'public',
                'password': 'todo',
            },
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

        return response.data.access_token;
    } catch (error) {
        console.error('Fehler beim Abrufen des Keycloak-Tokens', error);
        return null;
    }
}

export default getKeycloakToken
```


2. Importieren Sie die `getKeycloakToken`-Funktion in Ihrer Testdatei (`todo.test.js`)
   und verwenden Sie sie, um den Authorization-Header für Ihre geschützten Routen hinzuzufügen:

```javascript
import request from 'supertest';
import { app, server, db } from './index';
import getKeycloakToken from './utils';

let token; // Speichert den abgerufenen JWT-Token

beforeAll(async () => {
  token = await getKeycloakToken();
});

// Beispiel für einen geschützten Test:
describe('GET /todos', () => {
  it('sollte alle Todos abrufen', async () => {
    const response = await request(app)
      .get('/todos')
      .set('Authorization', `Bearer ${token}`); // Fügen Sie den Authorization-Header hinzu

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });
});
```

Jetzt sollten Ihre Tests den JWT-Token in den Authorization-Headern verwenden, um geschützte Routen zu testen. Stellen Sie sicher, dass Sie den Authorization-Header zu allen Testanfragen hinzufügen, die geschützte Routen betreffen.

## Aufgabe 2: Weitere Testfälle

Die Testfälle sollen alle CRUD Methoden abdecken. Erstellen Sie mindestens die folgenden 
Testfälle:

1. Testen Sie das Erstellen eines neuen Todos:

```javascript
const request = require('supertest');
const app = require('../app'); 

describe('POST /todos', () => {
    it('sollte ein neues Todo erstellen', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0
        };

        const response = await request(app)
           .post('/todos')
           .set('Authorization', `Bearer ${token}`)
           .send(newTodo);
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(newTodo.title);
        expect(response.body.due).toBe(newTodo.due);
    });
});
```

2. Testen Sie das Abrufen eines bestimmten Todos
   
   Hier benötigen Sie die `_id` eines konkreten Todos. Dieses können Sie vorher
   aus der MongoDB "ablesen".



3. Testen Sie das Aktualisieren eines bestimmten Todos

   Hier können Sie beispielsweise zunächst ein Todo erzeugen und dann anschließend 
   Werte des Todos ändern.


4. Testen Sie das Löschen eines bestimmten Todos:

   Auch hier ist es sinnvoll, zunächst ein Todo anzulegen und es anschließend wieder zu 
   löschen.
