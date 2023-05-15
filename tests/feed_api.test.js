//
// feed_api.test.js
// Tests for getting user post feeds.
//
// Created by Chikuma C., 05/14/2776 AUC
//
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

const helper = require('./test_helper');

describe('get user feeds', () => {
    let token = '';

    beforeAll(async () => {
        await helper.clearAndCreatePosts();
        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'chikuma', password: '123456789' })
            .expect(200);
        token = loginResponse.body.token;
    });

    // get feeds
    test('get recent post of user and its follower', async () => {
        const response = await api
            .get('/api/feed')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveLength(2);
    });
});