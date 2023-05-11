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
```


Um die Tests auszuführen, fügen wir in der `package.json` unter "scripts" den folgenden Eintrag hinzu:

```json
"scripts": {
  "test": "NODE_OPTIONS=--experimental-vm-modules npx jest"
}
```

Anschließend können Sie Ihre Tests mit `npm test` ausführen.
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

##

1. Testen Sie das Erstellen eines neuen Todos:

```javascript
const request = require('supertest');
const app = require('../app'); 

describe('POST /todos', () => {
  it('sollte ein neues Todo erstellen', async () => {
    const newTodo = {
      title: 'Test Todo',
      description: 'Test Description',
    };

    const response = await request(app).post('/todos').send(newTodo);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(newTodo.title);
    expect(response.body.description).toBe(newTodo.description);
  });
});
```

2. Testen Sie das Abrufen aller Todos:

```javascript
describe('GET /todos', () => {
  it('sollte alle Todos abrufen', async () => {
    const response = await request(app).get('/todos');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });
});
```

3. Testen Sie das Abrufen eines bestimmten Todos:

```javascript
describe('GET /todos/:id', () => {
  it('sollte ein einzelnes Todo abrufen', async () => {
    const todoId = 1; // Ersetzen Sie dies durch eine gültige Todo-ID
    const response = await request(app).get(`/todos/${todoId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(todoId);
  });
});
```

4. Testen Sie das Aktualisieren eines bestimmten Todos:

```javascript
describe('PUT /todos/:id', () => {
  it('sollte ein Todo aktualisieren', async () => {
    const todoId = 1; // Ersetzen Sie dies durch eine gültige Todo-ID
    const updatedTodo = {
      title: 'Updated Test Todo',
      description: 'Updated Test Description',
    };

    const response = await request(app).put(`/todos/${todoId}`).send(updatedTodo);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(updatedTodo.title);
    expect(response.body.description).toBe(updatedTodo.description);
  });
});
```

5. Testen Sie das Löschen eines bestimmten Todos:

```javascript
describe('DELETE /todos/:id', () => {
  it('sollte ein Todo löschen', async () => {
    const todoId = 1; // Ersetzen Sie dies durch eine gültige Todo-ID

    const response = await request(app).delete(`/todos/${todoId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('gelöscht');
  });
});
```

Vergessen Sie nicht, Ihren Testfall entsprechend Ihren tatsächlichen Routen und Benennungen anzupassen. Sie können auch weitere Tests hinzufügen, um Fehlerfälle oder zusätzliche Funktionen abzudecken.

Um Ihre Tests auszuführen, fügen Sie in Ihrer `package.json` unter "scripts" den folgenden Eintrag hinzu:

```json
"scripts": {
  "test": "jest"
}
```

Anschließend können Sie Ihre Tests mit `npm test` ausführen.