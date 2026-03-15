const request = require('supertest');
const app = require('../server');
const dbHandler = require('./setup');
const Role = require('../models/Role');
const User = require('../models/User');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Song Endpoints', () => {
    let token;
    let adminToken;

    beforeEach(async () => {
        // Seed roles
        const userRole = await Role.create({ roleName: 'user' });
        const adminRole = await Role.create({ roleName: 'admin' });

        // Register a regular user and get token
        const userRes = await request(app).post('/api/auth/register').send({
            name: 'Regular User',
            email: 'user@example.com',
            phone: '1234567890',
            password: 'password123'
        });
        const loginRes = await request(app).post('/api/auth/login').send({
            email: 'user@example.com',
            password: 'password123'
        });
        token = loginRes.body.token;

        // Create an admin user directly
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            phone: '0987654321',
            password: 'adminpassword', // Note: in real app this should be hashed, but for simplicity in test...
            roleId: adminRole._id
        });
        const adminLoginRes = await request(app).post('/api/auth/login').send({
            email: 'admin@example.com',
            password: 'adminpassword'
        });
        adminToken = adminLoginRes.body.token;
    });

    it('should fetch all songs (authenticated)', async () => {
        const res = await request(app)
            .get('/api/songs')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('should not allow regular user to add a song', async () => {
        const res = await request(app)
            .post('/api/songs')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'New Song' });

        expect(res.statusCode).toEqual(403); // adminOnly middleware should block this
    });

    it('should return 401 if not authenticated', async () => {
        const res = await request(app).get('/api/songs');
        expect(res.statusCode).toEqual(401);
    });
});
