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

describe('post of /api/feed response has liked field', () => {
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

describe('post of /api/post response has liked field', () => {
    let token = '';

    beforeAll(async () => {
        await helper.clearAndCreatePosts();
        token = await loginUtil.loginUser();
    });

    test('get', async () => {
        const post = (await helper.postsInDb())[0];
        const response = await api
            .get(`/api/post/${post.id}`)
            .expect(200);

        expect(response.body.liked).toBe(false);
    });

    test('post', async () => {
        const newPost = { context: 'This is a new post!' };
        const response = await api
            .post('/api/post')
            .set('Authorization', `Bearer ${token}`)
            .send(newPost)
            .expect(201);

        expect(response.body.liked).toBe(false);
    });

    test('like put', async () => {
        const post = (await helper.postsInDb())[0];
        const response = await api
            .put(`/api/post/like/${post.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.liked).toBe(true);
    });

    test('like delete', async () => {
        const post = (await helper.postsInDb())[0];
        const likeResponse = await api // first need to like the post
            .put(`/api/post/like/${post.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(likeResponse.body.liked).toBe(true);

        const deleteResponse = await api // then dislike it
            .delete(`/api/post/like/${post.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(deleteResponse.body.liked).toBe(false);
    });
});