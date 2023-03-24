# Benutzerverwaltung

## Authentisierung und Autorisierung

In "klassischen" Webanwendungen erfolgt die Autorisierung einzelner Zugriffe in der Regel über eine *Session* auf dem Server: Nachdem der Benutzer sich angemeldet hat, 
wird ein *Session-Cookie* gesetzt und der Server merkt sich, zu welchem Benutzer die Session gehört.

Dieses Vorgehen hat Nachteile, wenn die Anwendung aus mehreren *Micro Services* besteht oder wenn man das Backend skalieren möchte.

Eine Alternative ist die Autorisierung einzelner Zugriffe über *JSON Web Token*. Mit so einem – von einem Authentication Server ausgestellten – Token weißt sich das 
Frontend gegenüber dem Backend aus.   

```mermaid
sequenceDiagram
    participant Frontend
    participant Auth-Server
    participant Backend
    Frontend->>Auth-Server: /auth
    Auth-Server->>Frontend: redirect to login page
    Note right of Auth-Server: Follow Openid Connect<br>flow
    Frontend->>Auth-Server: Send username & password
    Auth-Server->>Frontend: Return access token

    Frontend->>Backend: DELETE /todos/4711
    Note right of Backend: Authorization via <br>JSON Web Token
```

## Keycloak-Server auf jupiter.fh-swf.de

Für das Praktikum ist auf jupiter.fh-swf.de ein Keycloak-Server mit der Realm `webentwicklung` eingerichtet. Dort gibt es einen Benutzer `public` mit dem Passwort `todo`.
Ein JSON Web Token für diesen Benutzer kann wie folgt mithilfe von `curl` abgerufen werden:

```shell
curl --location --request POST 'https://jupiter.fh-swf.de/keycloak/realms/webentwicklung/protocol/openid-connect/token' \
     --header 'Authorization: Basic dG9kby1iYWNrZW5kOnlpa2pBUk1KRFMyY0RLRXQ5cnZkRlc3ODFWOGpPcDZZ' \
     --header 'Content-Type: application/x-www-form-urlencoded' \
     --data-urlencode 'grant_type=password' \
     --data-urlencode 'username=public' \
     --data-urlencode 'password=todo'
```

Der zugehörige Public Key, mit der die JWTs signiert sind, lautet 
```
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyn2vP592Ju/iKXQW1DCrSTXyQXyo11Qed1SdzFWC+mRtdgioKibzYMBt2MfAJa6YoyrVNgOtGvK659MjHALtotPQGmis1VVvBeMFdfh+zyFJi8NPqgBTXz6bQfnu85dbxVAg95J+1Ud0m4IUXME1ElOyp1pi88+w0C6ErVcFCyEDS3uAajBY6vBIuPrlokbl6RDcvR9zX85s+R/s7JeP1XV/e8gbnYgZwxcn/6+7moHPDl4LqvVDKnDq9n4W6561s8zzw8EoAwwYXUC3ZPe2/3DcUCh+zTF2nOy8HiN808CzqLq1VeD13q9DgkAmBWFNSaXb6vK6RIQ9+zr2cwdXiwIDAQAB
```

## Aufgabe 1: Autorisierung der API-Zugriffe via JWT

In dieser Aufgabe sollen die Zugriffe auf das API vor unberechtigten Zugriffen geschützt werden.

### Aufgabe 1.1: Installation und Konfiguration von Passport.js

Installieren Sie `passport` und `passport-jwt`. Konfigurieren Sie Passport so, dass JWTs wahlweise als *Bearer Token* oder in einem Cookie gesendet werden können.

### Aufgabe 1.2: Erweiterung des Datenmodells

Sobald Zugriffe mit einem Benutzer erfolgen, ist es sinnvoll, den Benutzer mit in die MongoDB aufzunehmen (warum ist das so?). Erweitern Sie die Datenbankzugriffe so, dass ein Zugriff auf "fremde" Todos verboten ist und mit einem HTTP-Status 403 (*Forbidden*) beantwortet wird.

## Aufgabe 2: Test der Zugriffe

Testen Sie sowohl erlaubte als auch nicht erlaubte Zugriffe mit dem Tool `postman`.