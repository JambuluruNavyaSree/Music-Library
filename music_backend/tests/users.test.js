const request = require('supertest');
const app = require('../server');
const dbHandler = require('./setup');
const Role = require('../models/Role');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('User Endpoints', () => {
    let token;
    let userId;

    beforeEach(async () => {
        const userRole = await Role.create({ roleName: 'user' });

        const user = await User.create({
            name: 'Test User',
            email: 'user@example.com',
            phone: '1234567890',
            password: 'password123',
            roleId: userRole._id
        });

        userId = user._id;
        token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    });

    it('should get user profile', async () => {
        const res = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('email', 'user@example.com');
        expect(res.body).not.toHaveProperty('password');
    });

    it('should get user play history', async () => {
        const res = await request(app)
            .get('/api/users/play-history')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('should return 404 if user not found in profile', async () => {
        // This is a bit tricky with in-memory DB and JWT valid for an ID.
        // If we delete the user, it should return 404.
        await User.findByIdAndDelete(userId);

        const res = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(404);
    });
});
