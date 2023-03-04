# Persistenz der ToDo-Objekte

## Aufgabe 1: Beispiel-Todos importieren

In der Datei `todos.json` befinden sich zwei Beispiel-Todos. Zunächst wollen wir diese importieren:

```Shell
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