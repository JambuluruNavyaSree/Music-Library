const request = require('supertest');
const app = require('../server');
const dbHandler = require('./setup');
const Role = require('../models/Role');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Auth Endpoints', () => {
    let userRoleId;

    beforeEach(async () => {
        // Seed the user role for registration
        const role = await Role.create({ roleName: 'user' });
        userRoleId = role._id;
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                phone: '1234567890',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Registered successfully');
    });

    it('should not register a user with an existing email', async () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890',
            password: 'password123'
        };

        await request(app).post('/api/auth/register').send(userData);
        
        const res = await request(app)
            .post('/api/auth/register')
            .send(userData);

        expect(res.statusCode).toEqual(400);
    });

    it('should login an existing user', async () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890',
            password: 'password123'
        };

        await request(app).post('/api/auth/register').send(userData);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should not login with wrong password', async () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890',
            password: 'password123'
        };

        await request(app).post('/api/auth/register').send(userData);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message');
    });
});
