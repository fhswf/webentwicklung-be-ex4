import axios from 'axios';

async function getAuthToken() {
    const keycloakConfig = {
        baseUrl: 'https://keycloak.gawron.cloud',
        realm: 'webentwicklung',
        clientId: 'todo-backend',
    };

    const tokenEndpoint = `${keycloakConfig.baseUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;

    try {
        const response = await axios.post(tokenEndpoint,
            {
                'grant_type': 'password',
                'client_id': keycloakConfig.clientId,
                'username': 'public',
                'password': 'todo',
            },
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

        return response.data.access_token;
    } catch (error) {
        console.error('Fehler beim Abrufen des Keycloak-Tokens', error);
        return null;
    }
}

export default getAuthToken