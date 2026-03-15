const request = require('supertest');
const app = require('../server');
const dbHandler = require('./setup');
const Role = require('../models/Role');
const User = require('../models/User');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Playlist Endpoints', () => {
    let token;
    let userId;

    beforeEach(async () => {
        // Seed user role
        await Role.create({ roleName: 'user' });

        // Register and login
        await request(app).post('/api/auth/register').send({
            name: 'Playlist User',
            email: 'playlist@example.com',
            phone: '1234567890',
            password: 'password123'
        });
        const loginRes = await request(app).post('/api/auth/login').send({
            email: 'playlist@example.com',
            password: 'password123'
        });
        token = loginRes.body.token;
        userId = loginRes.body.user.id;
    });

    it('should create a new playlist', async () => {
        const res = await request(app)
            .post('/api/playlists')
            .set('Authorization', `Bearer ${token}`)
            .send({ playlistName: 'My Favorites' });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('playlistName', 'My Favorites');
        expect(res.body.userId.toString()).toEqual(userId.toString());
    });

    it('should fetch user playlists', async () => {
        // Create user's playlist
        await request(app)
            .post('/api/playlists')
            .set('Authorization', `Bearer ${token}`)
            .send({ playlistName: 'My Favorites' });

        const res = await request(app)
            .get('/api/playlists')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toHaveProperty('playlistName', 'My Favorites');
    });

    it('should return error for invalid playlist data', async () => {
        const res = await request(app)
            .post('/api/playlists')
            .set('Authorization', `Bearer ${token}`)
            .send({ description: 'No name provided' });

        expect(res.statusCode).toEqual(400);
    });
});
