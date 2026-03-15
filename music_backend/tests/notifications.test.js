const request = require('supertest');
const app = require('../server');
const dbHandler = require('./setup');
const Role = require('../models/Role');
const User = require('../models/User');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Notification Endpoints', () => {
    let token;
    let user;

    beforeEach(async () => {
        const userRole = await Role.create({ roleName: 'user' });

        user = await User.create({
            name: 'Test User',
            email: 'user@example.com',
            phone: '1234567890',
            password: 'password123',
            roleId: userRole._id
        });

        token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    });

    it('should get all notifications for the user', async () => {
        await Notification.create({ userId: user._id, message: 'Welcome!', type: 'system' });
        
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0]).toHaveProperty('message', 'Welcome!');
    });

    it('should mark a notification as read', async () => {
        const notification = await Notification.create({ userId: user._id, message: 'Unread', type: 'system', isRead: false });
        
        const res = await request(app)
            .patch(`/api/notifications/${notification._id}/read`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('isRead', true);
    });

    it('should mark all notifications as read', async () => {
        await Notification.create({ userId: user._id, message: 'Message 1', isRead: false });
        await Notification.create({ userId: user._id, message: 'Message 2', isRead: false });

        const res = await request(app)
            .put('/api/notifications/read-all')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'All notifications marked as read');
        
        const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });
        expect(unreadCount).toEqual(0);
    });

    it('should delete a notification', async () => {
        const notification = await Notification.create({ userId: user._id, message: 'To Be Deleted' });
        
        const res = await request(app)
            .delete(`/api/notifications/${notification._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Notification deleted');
        
        const deletedNotification = await Notification.findById(notification._id);
        expect(deletedNotification).toBeNull();
    });
});
