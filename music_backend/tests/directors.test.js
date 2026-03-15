const request = require('supertest');
const app = require('../server');
const dbHandler = require('./setup');
const Role = require('../models/Role');
const User = require('../models/User');
const MusicDirector = require('../models/MusicDirector');
const jwt = require('jsonwebtoken');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Director Endpoints', () => {
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

    it('should get all directors', async () => {
        await MusicDirector.create({ directorName: 'Christopher Nolan' });
        
        const res = await request(app)
            .get('/api/directors')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0]).toHaveProperty('directorName', 'Christopher Nolan');
    });

    it('should add a new director as admin', async () => {
        const res = await request(app)
            .post('/api/directors')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('directorName', 'Steven Spielberg')
            .field('bio', 'Famous director');

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('directorName', 'Steven Spielberg');
    });

    it('should update a director as admin', async () => {
        const director = await MusicDirector.create({ directorName: 'Original Director' });
        
        const res = await request(app)
            .put(`/api/directors/${director._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ directorName: 'Updated Director' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('directorName', 'Updated Director');
    });

    it('should delete a director as admin', async () => {
        const director = await MusicDirector.create({ directorName: 'To Be Deleted' });
        
        const res = await request(app)
            .delete(`/api/directors/${director._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Director deleted');
        
        const deletedDirector = await MusicDirector.findById(director._id);
        expect(deletedDirector).toBeNull();
    });
});
