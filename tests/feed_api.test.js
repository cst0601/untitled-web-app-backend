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
const loginUtil = require('./login_util');

describe('get user feeds', () => {
    let token = '';

    beforeAll(async () => {
        await helper.clearAndCreatePosts();
        token = await loginUtil.loginUser();
    });

    // get feeds
    test('get recent post of user and its follower', async () => {
        const response = await api
            .get('/api/feed')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveLength(2);
        expect(response.body[0].likes).toBe(0);
    });

    test('if user does not exist', async () => {
        const response = await api
            .get('/api/feed/non-exist-username')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.error).toBe('The requested user does not exist');
    });
});