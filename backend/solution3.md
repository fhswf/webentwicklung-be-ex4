Um eine REST-API für eine Todo-Anwendung mit JWT zu sichern, die von einem Keycloak-Server ausgestellt werden, und Passport.js zu verwenden, führen Sie die folgenden Schritte aus:

1. Installieren Sie die erforderlichen Pakete

```bash
npm install express passport passport-jwt keycloak-connect jsonwebtoken body-parser cors
```

2. Erstellen Sie eine `app.js`-Datei und fügen Sie die erforderlichen Module hinzu:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const cors = require('cors');


const app = express();

// CORS-Middleware
app.use(cors());

// Body-parser-Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const keycloak = new Keycloak({}, keycloakConfig);
app.use(keycloak.middleware());

// Passport.js JWT-Strategie
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: keycloakConfig.secret,
  issuer: keycloakConfig.serverUrl,
  audience: keycloakConfig.clientId
};

passport.use(
  new JwtStrategy(opts, (payload, done) => {
    // Hier können Sie zusätzliche Validierungen oder Benutzerabfragen durchführen, falls erforderlich
    return done(null, payload);
  })
);

app.use(passport.initialize());

// Routen
app.get(
  '/todos',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // ...
  }
);

// Starten Sie den Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

Durch diesen Code wird Ihre REST-API für die Todo-Anwendung mit JWT abgesichert. Es ist wichtig, dass Sie die Keycloak- und Passport.js-Konfigurationen an Ihre Keycloak-Server-Umgebung anpassen.