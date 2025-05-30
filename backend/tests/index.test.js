// filepath: backend/__tests__/index.test.js
import request from 'supertest';
import { app, db, server } from '../index.js'; // ggf. muss der Express-App-Export angepasst werden


import getAuthToken from './util.js';

let token; // Speichert den abgerufenen JWT-Token
let expressServer;

beforeAll(async () => {
  expressServer = await server; // Ensure the server is started before tests
  console.log("Server started for testing");
  token = await getAuthToken();
  console.log("Keycloak token retrieved:", token);
});

afterAll(async () => {
  expressServer.close()
  db.close()
});

describe('GET /api/todos', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/todos');
    expect(res.statusCode).toBe(200);
  });
});