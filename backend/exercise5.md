#  Backend & Frontend verbinden

In den bisherigen Aufgaben dieses Semesters haben wir uns ausschließlich mit dem Backend beschäftigt. 
Dieses Mal wollen wir das Frontend (aus dem letzten Semester) mit dem Backend verbinden.

Dazu gehen wir wie folgt vor:

1.  **Implementierung des Logins**<br>
    Da unser Backend ein JWT zur Authentifizierung benötigt, müssen wir uns vor ersten Tests um das Login kümmern
    (Tatsächlich ist das ein Punkt, den ich im nächsten Jahr ändern werde – die Verknüpfung zwischen Backend und Frontend hätten wir besser *vor* der Benutzerverwaltung vorgenommen).

    Da wir OpenID Connect verwenden, müssen wir folgendes tun:
    - Im Frontend müssen wir bei Aufruf des Backends den Status `401 (Unauthorized)` abfangen. 
        Wenn wir diesen Status erhalten, müssen wir den Browser zur Login-Seite in Keycloak weiterleiten und dabei 
        einige Parameter setzen (s.u.).
    - Im Backend benötigen wir eine Route `oauth_callback`, auf die wir nach dem erfolgreichen Login 
      weiterleiten.
      Diese Route erhält unter anderem den Authorization Code (im Parameter `code`). Mit diesem ruft das Backend 
      das eigentliche Access-Token als JWT von Keycloak.
      Dieses JWT wird dann als **Cookie** gesetzt. 

    Den gesamten Ablauf kann man sehr gut im [OpenID Connect Playground](https://openidconnect.net/) "durchspielen".

2.  **Erweiterung der Authentisierung auf *Cookies***<br>
    Bisher erwartet das Backend das JWT in einem *Authorization-Header*. Wir müssen das Backend so erweitern, 
    dass JWT alternativ auch aus einem Cookie gelesen werden.

3.  **Anpassung des Frontends**<br>
    Jetzt können wir das Frontend so anpassen, dass ToDos nicht mehr im *LocalStorage* gespeichert werden, 
    sondern die entsprechenden REST-Methoden des Backends verwendet werden.

4.  **Härtung gegen CSRF**<br>
    Unter *Cross-Site-Request-Forgery* versteht man einen Angriff, in dem "fremder" Javascript-Code
    Requests auf eine Anwendung absetzt. 
    
    Um Sicherzustellen, dass ein Login wirklich von der "richtigen" Anwendung initiiert wurde, verwendet OpenID Connect einen `state` Parameter.  
   
## Aufgabe 1.1: Implementierung des Logins im Frontend

Sorgen Sie zunächst dafür, dass Sie die Dateien aus dem Frontend über Ihren Node-Server aufrufen können (das ist wichtig, um CORS-Probleme zu vermeiden und damit wir möglichst einfach die passenden URLs bilden können):
```Javascript
app.use(express.static('../frontend'));
```

Im Frontend rufen wir für die CRUD-Operationen das REST-API via `fetch()` auf.
Die folgende Funktion prüft den Status der Response und leitet den Browser bei Bedarf auf die Login-Seite des Keycloak-Servers um:

```Javascript
/** Check whether we need to login.
 * Check the status of a response object. If the status is 401, construct an appropriate 
 * login URL and redict there.
 * 
 * @param response Response object to check
 * @returns original response object if status is not 401
 */
function checkLogin(response) {
    // check if we need to login
    if (response.status == 401) {
        console.log("GET %s returned 401, need to log in", API)
        let params = new URLSearchParams()
        params.append("response_type", "code")
        params.append("redirect_uri", new URL("/oauth_callback", window.location))
        params.append("client_id", "todo-backend")
        params.append("scope", "openid")

        // redirect to login URL with proper parameters
        window.location = LOGIN_URL + "?" + params.toString()
        throw('Need to log in')
    }
    else return response
}
```

Fügen Sie diese Funktion im Frontend (`frontend/todo.js`) ein und implementieren Sie die Funktion `loadTodos()` mithilfe des des REST-APIs neu.

## Aufgabe 1.2: Implementierung des Logins im Backend

Fügen Sie zunächst im Backend eine Route für den OAuth-Callback hinzu:

```Javascript
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
            // Set cookie with the token an redirect to main page
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
```

Erweitern Sie dann die Methode zum Extraktion des JWT aus dem Request so, dass es auch ein JWT 
als Cookie erkennt. 

- Installieren Sie dazu das NPM-Paket `cookie-parser`:

    ```
    npm install --save cookie-parser
    ```
- Aktiveren Sie den Cookie-Parser:
    ```Javascript
    app.use(cookieParser())
    ```

- Lesen Sie bei Bedarf das Cookie aus:

    ```Javascript
    jwtFromRequest: (req) => {
            let token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
            if (!token && req.cookies.token) {
                    token = req.cookies.token
                }
            }
            console.log("token: %s", token)
            return token
        },
    ```

## Aufgabe 2: Anpassung der CRUD-Funktionen im  Frontend

Passen Sie nun auch die übrigen CRUD-Funktionen im Frontend so an, dass die 
Operationen des REST-APIs verwendet werden.

## Aufgabe 3: Härtung gegen CSRF

Mit der bisherigen Implementierung können wir nicht sicher sein, 
dass Zugriffe auf den `oauth_callback` von unserer Anwendung initiiert wurden.
Damit könnte eine bösartige Webanwendung auf versuchen, sich ein Token 
zu "erschleichen". Zu Details siehe [What is the purpose of the state parameter in oauth authorization request](https://stackoverflow.com/questions/26132066/what-is-the-purpose-of-the-state-parameter-in-oauth-authorization-request). 
Ein Punkt ist dabei auch, dass Keycloak und andere IdPs selber 
Session-Cookies setzen. Wenn diese gültig sind, funktioniert der Login ohne
erneute Eingabe von Username und Passwort!

Zur Härtung gegen diesen Angriffskanal erzeugt das Backend vor dem Login 
einen zufälligen Wert `state` und merkt sich diesen (Da es mehrere parallele
Clientverbindungen geben kann, muss man sich mehrere Werte merken. 
Wir verwenden ein Objekt als Ersatz für ein Dictionary). 

Da in unserer Anwendung die Weiterleitung zur Login-Seite vom Client 
ausgelöst wird, verwenden wir ein Cookie `state` um den Wert an den 
Client zu kommunizieren.

Wir definieren dazu eine Middleware `authenticate`, die wir bei allen Routen 
zur Prüfung nutzen können, ob der Benutzer angemeldet ist. Ist der Nutzer *nicht* angemeldet, erzeugen wir einen neuen Wert für `state`, merken ihn uns und setzen ihn als Cookie:

```Javascript
import { getRandomValues } from 'crypto';

// ...

let authenticate = (req, res, next) => passport.authenticate('jwt',
    { session: false },
    (err, user, info) => {
        console.log("authenticate: %j %j %j", err, user, info)
        if (!user) {
            let data = new Uint8Array(16);
            getRandomValues(data);
            let state = Buffer.from(data).toString('base64');
            state_dict[state] = Date.now()
            res.cookie("state", state, { maxAge: 900000, httpOnly: false })
            res.sendStatus(401)
            return
        }
        next()
    })(req, res, next)
```

Im `oauth_callback` prüfen wir, ob der `state` bekannt ist:

```Javascript
/** Endpoint for OpenID connect callback */
app.get('/oauth_callback', async (req, res) => {
    let code = req.query.code
    // Achtung: Unser Base64-codierter Wert enthält ggf. 
    // Gleichheitszeichen '=', die bei der Übertragung kodiert werden!
    let state = decodeURIComponent(req.query.state)
    console.log("oauth_callback: code: %s, state: %s", code, state)
    if (state in state_dict) {
        delete state_dict[state]
    }
    else {
        console.log("state %s not in state_dict %j, XSRF?", state, state_dict)
        res.sendStatus(400, `state ${state} not in state_dict, XSRF?`)
        return
    }
    // Rest wie vorher
```