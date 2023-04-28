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
   


```
npm install --save cookie-parser
```