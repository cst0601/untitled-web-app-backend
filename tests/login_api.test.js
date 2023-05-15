//
// login_api.test.js
// Login API test
//
// Created by Chikuma C., 05/12/2776 AUC
//
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const api = supertest(app);

describe('login', () => {
    beforeEach(async () => {
        await helper.clearAndCreateUsers();
    });

    test('login success', async () => {
        const loginData = {
            username: 'chikuma',
            password: '123456789',
        };

        const response = await api
            .post('/api/login')
            .send(loginData)
            .expect(200);

        expect(response.body.username).toBe(loginData.username);
        expect(response.body.displayName).toBe('Chikuma');
        expect(response.body).toHaveProperty('token');
    });

    test('login failed, wrong password', async () => {
        const loginData = {
            username: 'chikuma',
            password: 'abcdefg',
        };

        const response = await api
            .post('/api/login')
            .send(loginData)
            .expect(401);

        expect(response.body.error).toBe('invalid username or password');
    });

    test('login failed, username does not exist', async () => {
        const loginData = {
            username: 'nonexist_user',
            password: '123456789',
        };

        const response = await api
            .post('/api/login')
            .send(loginData)
            .expect(401);

        expect(response.body.error).toBe('invalid username or password');
    });
});