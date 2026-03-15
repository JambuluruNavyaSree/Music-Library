const request = require('supertest');
const app = require('../server');
const dbHandler = require('./setup');
const Role = require('../models/Role');
const User = require('../models/User');
const Album = require('../models/Album');
const jwt = require('jsonwebtoken');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Album Endpoints', () => {
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

    it('should get all albums', async () => {
        await Album.create({ albumName: 'Abbey Road', releaseYear: 1969 });
        
        const res = await request(app)
            .get('/api/albums')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0]).toHaveProperty('albumName', 'Abbey Road');
    });

    it('should add a new album as admin', async () => {
        const res = await request(app)
            .post('/api/albums')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ albumName: 'Thriller', releaseYear: 1982 });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('albumName', 'Thriller');
    });

    it('should not add a new album as regular user', async () => {
        const res = await request(app)
            .post('/api/albums')
            .set('Authorization', `Bearer ${token}`)
            .send({ albumName: 'Thriller', releaseYear: 1982 });

        expect(res.statusCode).toEqual(403);
    });

    it('should update an album as admin', async () => {
        const album = await Album.create({ albumName: 'Original Name', releaseYear: 2000 });
        
        const res = await request(app)
            .put(`/api/albums/${album._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ albumName: 'Updated Name' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('albumName', 'Updated Name');
    });

    it('should delete an album as admin', async () => {
        const album = await Album.create({ albumName: 'To Be Deleted', releaseYear: 2000 });
        
        const res = await request(app)
            .delete(`/api/albums/${album._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Album deleted');
        
        const deletedAlbum = await Album.findById(album._id);
        expect(deletedAlbum).toBeNull();
    });
});
