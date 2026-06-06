async function getAuthToken() {
    const keycloakConfig = {
        baseUrl: 'https://keycloak.gawron.cloud',
        realm: 'webentwicklung',
        clientId: 'todo-backend',
    };

    const tokenEndpoint = `${keycloakConfig.baseUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;

    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                'grant_type': 'password',
                'client_id': keycloakConfig.clientId,
                'username': 'public',
                'password': 'todo',
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Fehler beim Abrufen des Keycloak-Tokens', error);
        return null;
    }
}

export default getAuthToken