# Aufgabe 6: Testfälle für das Backend mit Jest

Es sieht so aus, als hätten Sie in diesem Repository möglicherweise noch keine Tests eingerichtet. In dieser Aufgabe richten Sie automatisierte Tests für Ihr Express-Backend ein und schreiben erste Testfälle.

## Aufgabe 1.1: Testframework auswählen und installieren

Wir verwenden das Testframework **Jest**, da es einfach einzurichten ist und gut mit Node.js/Express zusammenarbeitet. Zusätzlich verwenden wir **Supertest**, um HTTP-Anfragen an unsere Express-App zu senden und die Antworten zu überprüfen.

1. Installieren Sie Jest und Supertest als Entwicklungsabhängigkeiten:

    ```bash
    npm install --save-dev jest supertest axios
    ```

2. Fügen Sie in Ihrer `package.json`-Datei ein Test-Skript hinzu:

   ```json
    "scripts": {
      "test": "NODE_OPTIONS='--experimental-vm-modules' jest"
    }
    ```

3. Erstellen Sie eine Datei `jest.config.js` im Stammverzeichnis Ihres Projekts mit folgendem Inhalt:

    ```js
    export default {
        testEnvironment: 'node',
        testMatch: ['**/tests/**/*.test.js'],
    };
    ```

## Aufgabe 1.2: Anpassungen an der Anwendung

An der Anwendung müssen wir ein paar kleine Änderungen vornehmen, damit wir sie mit `supertest` und `jest` testen können. Supertest benötigt Zugriff auf das `app` 
Objekt und muss in der Lage sein, nach den Tests die Anwendung zu beenden. Dazu brauchen
wir Zugriff auf den gestarteten Server und die Datenbank. 
Ändern Sie dazu den Code am Ende der Datei `index.js` wie folgt ab:

```Javascript
let server = initDB()
    .then(() => {
        server = app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        })
        return server
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

In den Tests verwenden wir die Methoden `beforeAll` und `afterAll`, um die Datenbank zu initialisieren und zu schließen:

```javascript
import { app, server, db } from '../index.js';

beforeAll(async () => {
  expressServer = await server; // Ensure the server is started before tests
  console.log("Server started for testing");
});

afterAll(async () => {
  expressServer.close()
  db.close()
});
```

## Aufgabe 1.3: Token für Tests generieren (optional)

Falls Sie in Ihren Tests auf geschützte Endpunkte zugreifen möchten, benötigen Sie ein gültiges JWT.
Dazu gibt es in der Datei `tests/utils.js` eine Hilfsfunktion `getAuthToken()`, die ein JWT für den Benutzer `public` generiert.
Sie können diese Funktion in der Methode `beforeAll` verwenden, um ein Token zu erhalten, das Sie für die Authentifizierung bei geschützten Endpunkten verwenden können:

```javascript
import { getAuthToken } from './utils.js';

beforeAll(async () => {
  expressServer = await server; // Ensure the server is started before tests
  console.log("Server started for testing");
  token = await getAuthToken();
  console.log("Keycloak token retrieved:", token);
});
```

## Aufgabe 2: Ersten Test schreiben & ausführen
1. Legen Sie im Verzeichnis `backend/tests` eine Datei `index.test.mjs` an.
2. Schreiben Sie einen ersten Beispiel-test, der überprüft, ob die Express-App korrekt läuft:

    ```javascript   
    import request from 'supertest';
    import app from '../index.js'; 

    beforeAll(async () => {
        await initDB(); // Ensure the database is initialized before tests
    });

    describe('GET /todos', () => {
        it('should return a list of todos', async () => {
            const response = await request(app).get('/todos');
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
        });
    });
    ```

    > Hinweis: Damit der Test funktioniert, muss Ihre Express-App als Modul exportiert werden, 
    > z.B. mit `export default app;` in `index.js`.

3. Führen Sie die Tests mit folgendem Befehl aus:

    ```bash
    npm test
    ```

## Aufgabe 3: Weitere Tests hinzufügen

Fügen Sie weitere Tests für Ihre API-Endpunkte hinzu. Hier sind einige Beispiele:
- [ ] Testen Sie, ob ein neuer Todo-Eintrag erfolgreich erstellt werden kann.
- [ ] Testen Sie, ob ein Todo-Eintrag aktualisiert werden kann.
- [ ] Testen Sie, ob ein Todo-Eintrag gelöscht werden kann.

Dabei sollten Sie verschiedene Szenarien abdecken, z.B.:
- Erfolgreiche Erstellung eines Todo-Eintrags, inkl. Prüfung, dass das Todo anscchließend abgerufen werden kann
- Versuch, einen Todo-Eintrag mit ungültigen Daten zu erstellen
- Überprüfung, ob die richtigen Fehlermeldungen zurückgegeben werden
- Testen, dass ein gelöschter Todo-Eintrag nicht mehr existiert
- Testen, dass ein aktualisierter Todo-Eintrag die erwarteten Änderungen aufweist
- Testen von Edge Cases, z.B. das Löschen eines nicht existierenden Todo-Eintrags
