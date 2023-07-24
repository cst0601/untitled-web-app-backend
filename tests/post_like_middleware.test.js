//
// post_like_middleware.test.js
// Tests for middleware for adding liked field to post.
//
// Created by Chikuma C., 07/24/2776 AUC
//
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

const helper = require('./test_helper');
const loginUtil = require('./login_util');

describe('feed api adding liked field', () => {
    let token = '';

    beforeAll(async () => {
        await helper.clearAndCreatePosts();
        token = await loginUtil.loginUser();
    });

    test('feed api', async () => {
        const response = await api
            .get('/api/feed')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveLength(2);
        for (const post of response.body) {
            expect(post).toHaveProperty('liked', false);
        }
    });
});

describe('post api adding liked field', () => {


});