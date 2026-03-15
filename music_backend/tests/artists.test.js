const request = require('supertest');
const app = require('../server');
const dbHandler = require('./setup');
const Role = require('../models/Role');
const User = require('../models/User');
const Artist = require('../models/Artist');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Artist Endpoints', () => {
    let token;
    let adminToken;

    beforeEach(async () => {
        const userRole = await Role.create({ roleName: 'user' });
        const adminRole = await Role.create({ roleName: 'admin' });

        const user = await User.create({
            name: 'Test User',
            email: 'user@example.com',
            phone: '1234567890',
            password: 'password123',
            roleId: userRole._id
        });

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            phone: '0987654321',
            password: 'password123',
            roleId: adminRole._id
        });

        token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        adminToken = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    });

    it('should get all artists', async () => {
        await Artist.create({ artistName: 'The Beatles' });
        
        const res = await request(app)
            .get('/api/artists')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0]).toHaveProperty('artistName', 'The Beatles');
    });

    it('should add a new artist as admin (without photo)', async () => {
        const res = await request(app)
            .post('/api/artists')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('artistName', 'Queen')
            .field('bio', 'British rock band');

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('artistName', 'Queen');
    });

    it('should update an artist as admin', async () => {
        const artist = await Artist.create({ artistName: 'Original Artist' });
        
        const res = await request(app)
            .put(`/api/artists/${artist._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ artistName: 'Updated Artist' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('artistName', 'Updated Artist');
    });

    it('should delete an artist as admin', async () => {
        const artist = await Artist.create({ artistName: 'To Be Deleted' });
        
        const res = await request(app)
            .delete(`/api/artists/${artist._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Artist deleted');
        
        const deletedArtist = await Artist.findById(artist._id);
        expect(deletedArtist).toBeNull();
    });
});
