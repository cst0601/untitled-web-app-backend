//
// user_api.test.js
// User related api operations test, url starts with /api/user
//
// Created by Chikuma C., 05/12/2776 AUC
//
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const loginUtil = require('./login_util');

const api = supertest(app);

describe('user_api', () => {
    beforeEach(async () => {
        await helper.clearAndCreateUsers();
    });

    test('get user of username', async () => {
        const expectUser = (await helper.usersInDb())[0];

        const response = await api
            .get(`/api/user/${expectUser.id}`)
            .expect(200);
        const user = response.body;

        expect(user.username).toBe(expectUser.username);
        expect(user.displayName).toBe(expectUser.displayName);
    });

    test('non-exist user id, response 404', async () => {
        await api
            .get('/api/user/64f777a5ed8eb179aaaaaceb')
            .expect(404);
    });

    test('create user', async () => {
        const newUser = {
            username: 'new_user_name',
            displayName: 'Nie',
            password: 'p@ssword123456',
        };

        const response = await api
            .post('/api/user')
            .send(newUser)
            .expect(201);

        expect(response.body).toHaveProperty('token');

        const users = await helper.usersInDb();
        const user = users.filter(u => u.username === newUser.username)[0];
        expect(user.displayName).toBe('Nie');
    });

    test('create user, password too short', async () => {
        const newUser = {
            username: 'password_too_short',
            displayName: 'destinedToFail',
            password: '0',
        };

        await api
            .post('/api/user')
            .send(newUser)
            .expect(400);
    });
});

describe('user api with user token', () => {
    let token = '';

    beforeAll(async () => {
        await helper.clearAndCreateUsers();
        token = await loginUtil.loginUser();
        await helper.followUserByUsername('sakuramiko35');
    });

    test('user info with token success', async () => {
        const userId = (await helper.usersInDb()).find(
            user => user.username === 'sakuramiko35').id;
        const response = await api
            .get(`/api/user/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.username).toBe('sakuramiko35');
        expect(response.body.displayName).toBe('さくらみこ');
        expect(response.body.id).toBe(userId);
        expect(response.body.isFollowed).toBe(true);
    });

    test('bad token response with status 401', async () => {
        const userId = (await helper.usersInDb()).find(
            user => user.username === 'sakuramiko35').id;
        const response = await api
            .get(`/api/user/${userId}`)
            .set('Authorization', 'Bearer badtoken')
            .expect(401);
        expect(response.body.error).toBe('invalid token');
    });
});