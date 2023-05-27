import request from 'supertest';
import { app, server, db } from './index';

describe('GET /requirements', () => {
    it('should return all requirements', async () => {
        const response = await request(app).get('/requirements');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });
});
