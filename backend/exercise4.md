# Dokumentation mit Swagger & Validierung

## Aufgabe 1: Swagger-Dokumentation für das REST-API

Führen Sie die folgenden Schritte au, um eine Swagger-Dokumentation zu Ihrem Express.js REST API hinzuzufügen:

1. Installieren Sie die benötigten Pakete:

```bash
npm install swagger-ui-express swagger-jsdoc
```

2. Importieren Sie die Pakete in Ihrer Express-Anwendung (`index.js`):

```javascript
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
```

3. Erstellen Sie die Swagger-Options:

```javascript
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
  },
  apis: ['./index.js'], 
};
```

4. Erstellen Sie die Swagger-Dokumentation mit den angegebenen Optionen:

```javascript
const swaggerDocs = swaggerJsdoc(swaggerOptions);
```

5. Fügen Sie den Swagger-UI-Middleware hinzu:

```javascript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
```

6. Fügen Sie in Ihren Route-Dateien (`index.js`, sofern Sie Ihre Anwendung nicht weiter modularisiert haben) Kommentare hinzu, um die API-Endpunkte zu dokumentieren.
Hier ist ein Beispiel für die `/todos` GET-Route:

```javascript
/**
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
router.get('/todos', async (req, res) => {
  // Ihre Logik zum Abrufen der Todos
});
```

7. Definieren Sie die Schemas für Ihre API-Objekte, indem Sie sie zu den `swaggerOptions` hinzufügen:

```javascript
const swaggerOptions = {
  // ...
  components: {
    schemas: {
      Todo: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
          },
          due: {
            type: 'string',
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
  }]
  // ...
};
```

8. Starten Sie Ihre Anwendung, und öffnen Sie `http://localhost:3000/api-docs` in Ihrem Browser, um die Swagger-Dokumentation zu sehen.

Mit diesen Schritten haben Sie eine grundlegende Swagger-Dokumentation für Ihre Express.js REST API erstellt. Sie können die Dokumentation weiter anpassen, indem Sie mehr Kommentare und Schemas für Ihre API-Endpunkte hinzufügen. Weitere Informationen finden Sie in der offiziellen [Swagger-OpenAPI-Dokumentation](https://swagger.io/specification/).


## Aufgabe 2: Validierung der Daten

Gehen Sie wie folgt vor, um `express-validator` zur Überprüfung der Daten in Ihrem REST API zu verwenden:

1. Installieren Sie das Paket `express-validator`:

```bash
npm install express-validator
```

2. Importieren Sie `express-validator` in der Datei, in der Sie Ihre Routen definieren (z.B. `todos.js`):

```javascript
const { check, validationResult } = require('express-validator');
```

3. Fügen Sie Validierungsregeln für die gewünschten Routen hinzu. Zum Beispiel, um die Titel bei der Erstellung eines neuen Todos zu validieren, fügen Sie die folgenden Regeln hinzu:

```javascript
const todoValidationRules = [
  check('title')
    .notEmpty()
    .withMessage('Titel darf nicht leer sein')
    .isLength({ min: 3 })
    .withMessage('Titel muss mindestens 3 Zeichen lang sein'),
];
```

4. Fügen Sie die Validierungsregeln als Middleware in Ihren Routen hinzu:

```javascript
app.post('/todos', todoValidationRules, async (req, res) => {
  // ...
});
```

5. Überprüfen Sie, ob Validierungsfehler aufgetreten sind, und senden Sie gegebenenfalls eine Fehlerantwort:

```javascript
app.post('/todos', todoValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // Ihre Logik zum Erstellen eines neuen Todos
});
```

In diesem Beispiel haben wir die Validierung des Titels beim Erstellen eines neuen Todos hinzugefügt. 
**Erstellen Sie weitere Validierungsregeln für andere Routen und fügen Sie sie entsprechend hinzu.**

Weitere Informationen und Beispiele zur Verwendung von `express-validator` finden Sie in der offiziellen [Dokumentation](https://express-validator.github.io/docs/).
