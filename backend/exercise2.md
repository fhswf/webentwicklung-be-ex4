# Persistenz der ToDo-Objekte

## Aufgabe 1: Beispiel-Todos importieren

Bevor wir mit der Implementierung des Backends beginnen, initialisieren wir die Datenbank mit einigen Beispiel-Todos. Dazu erstellen wir eine neue Datenbank `todos` und eine neue Collection `todos`.

In der Datei `todos.json` befinden sich dazu zwei Beispiel-Todos. Zunächst wollen wir diese importieren und dabei die Datenbank und die Collection anlegen. Dazu verwenden wir den Befehl `mongoimport`:

```MongoDB
mongoimport -c todos --jsonArray --file todos.json --db todos
```

Anschließend kontrollieren Sie mithilfe der Mongo-Shell, ob die Daten korrekt importiert wurden:

```MongoDB
mongosh 

test> use todos
switched to db todos

test> db.todos.find()
[
  {
    _id: ObjectId("6403604ac1febec4d03dae85"),
    title: 'Für die Klausur Webentwicklung lernen',
    due: '2023-01-14T00:00:00.000Z',
    status: 2
  },
  {
    _id: ObjectId("6403604ac1febec4d03dae86"),
    title: 'Übung 4 machen',
    due: '2022-11-12T00:00:00.000Z',
    status: 0
  }
]

test>
```

## Aufgabe 2: ToDo-Objekte in der Datenbank speichern

Zunächst installieren wir den Node.js Treiber für MongoDB:

```bash
npm install mongodb
```

In der Datei `backend/src/db.js` finden Sie eine Klasse DB, die eine Verbindung zur Datenbank herstellt und die CRUD-Operationen auf der Collection `todos` implementiert. Die Klasse DB wird in der Datei `backend/src/app.js` importiert und verwendet.

### Aufgabe 2.1: Implementieren Sie die fehlenden Datenbank-Methoden

Die Methode `DB.queryAll()` ist bereits implementiert. Implementieren Sie analog die fehlenden Methoden für die übrigen CRUD-Operationen analog zu `DB.queryAll()`.
Die Methoden können jeweils ein `Promise` zurückgeben. Mit den entsprechenden Methoden des Mongo-Treibers (s. [Dokumentation](https://www.mongodb.com/docs/drivers/node/current/)) handelt es sich jeweils um wenige Zeilen.

### Aufgabe 2.2: Implementieren Sie die fehlenden REST-Endpoints

Der REST-Endpoint `GET /todos` ist bereits implementiert. Implementieren Sie analog die fehlenden REST-Endpoints für die übrigen CRUD-Operationen analog zu `GET /todos`.

### Aufgabe 2.3: Testen Sie die REST-Endpoints

Testen Sie die REST-Endpoints mit Hilfe von [Postman](https://www.postman.com/) oder einem anderen REST-Client.