//
// user_api.test.js
// User related api operations test, url starts with /api/user
//
// Created by Chikuma C., 05/12/2776 AUC
//
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');

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

    test('create user', async () => {
        const newUser = {
            username: 'new_user_name',
            displayName: 'Nie',
            password: 'p@ssword123456',
        };

        await api
            .post('/api/user')
            .send(newUser)
            .expect(201);

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