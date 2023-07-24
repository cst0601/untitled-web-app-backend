//
// post_api.test.js
// Test post related operations, uri starts with /api/post
//
// Created by Chikuma C., 05/12/2776 AUC
//
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

const helper = require('./test_helper');
const loginUtil = require('./login_util');

describe('user posts', () => {
    let expectPost = null;

    beforeAll(async () => {
        await helper.clearAndCreatePosts();
        expectPost = (await helper.postsInDb())[0];
    });

    test('posts are returned as json', async () => {
        await api
            .get(`/api/post/${expectPost.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('get a specific post with id', async () => {
        const response = await api
            .get(`/api/post/${expectPost.id}`)
            .expect(200);

        expect(response.body.context).toBe(expectPost.context);
        expect(response.body.likes).toBe(0);
        expect(response.body.user.id).toBe(expectPost.user.toString());
    });

    test('Id vaild but post does not exist', async () => {
        const userId = expectPost.user.id;
        const postId = await helper.nonExistingPostId(userId);
        const response = await api
            .get(`/api/post/${postId}`)
            .expect(404);

        expect(response.body.error).toBe('post does not exist or deleted.');
    });

    test('Id invalid, receive status 400', async () => {
        const invalidId = '5a3d5da59070081a82a3445';

        await api
            .get(`/api/post/${invalidId}`)
            .expect(400);
    });
});

// user login needs to work for this one
describe('user creates / delete a post', () => {
    let token = '';

    beforeAll(async () => {
        await helper.clearAndCreatePosts();
        token = await loginUtil.loginUser();
    });

    test('add post success', async () => {
        const newPost = {
            context: 'This is a new post!',
        };

        const response = await api
            .post('/api/post')
            .set('Authorization', `Bearer ${token}`)
            .send(newPost)
            .expect(201);

        expect(response.body.likes).toBe(0);
        expect(response.body.context).toBe('This is a new post!');
        expect(response.body).toHaveProperty('createdAt');
        expect(response.body).toHaveProperty('updatedAt');
        expect(response.body.user.username).toBe('chikuma');
    });

    test('add post failed, did not login', async () => {
        const newPost = {
            context: 'This is a new post',
        };

        await api
            .post('/api/post')
            .send(newPost)
            .expect(401);
    });

    test('delete post success', async () => {
        const deletePostId = (await helper.postsInDb())[0].id;

        await api
            .delete(`/api/post/${deletePostId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204);

        const posts = await helper.postsInDb();
        expect(posts.some(id => id === deletePostId)).toBe(false);
    });

    test('delete post failed, user does not match', async () => {
        // login as a different user
        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'sakuramiko35', password: '123456789' })
            .expect(200);

        const deletePostId = (await helper.postsInDb())[0].id;
        await api
            .delete(`/api/post/${deletePostId}`)
            .set('Authorization', `Bearer ${loginResponse.body.token}`)
            .expect(401);
    });

    test('delete post failed, did not login', async () => {
        const deletePostId = (await helper.postsInDb())[0].id;

        await api
            .delete(`/api/post/${deletePostId}`)
            .expect(401);
    });
});

describe('user liked / unliked a post', () => {
    let token = '';

    beforeAll(async () => {
        await helper.clearAndCreatePosts();
        token = await loginUtil.loginUser();
    });

    test('like action returns the full post', async () => {
        const likedPost = (await helper.postsInDb())[0];

        const response = await api.put(`/api/post/like/${likedPost.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        const resPost = response.body;
        const userInfo = resPost.user;

        expect(resPost).toHaveProperty('user');
        expect(resPost).toHaveProperty('context');
        expect(resPost).toHaveProperty('createdAt');
        expect(resPost).toHaveProperty('updatedAt');
        expect(resPost).toHaveProperty('likes');
        expect(resPost).toHaveProperty('id');

        expect(userInfo).toHaveProperty('username');
        expect(userInfo).toHaveProperty('displayName');
        expect(userInfo).toHaveProperty('id');
    });

    test('user liked a post', async () => {
        const likedPost = (await helper.postsInDb())[0];

        await api.put(`/api/post/like/${likedPost.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const likes = await helper.likesInDb();
        const entry = likes.find(
            like => like.postId.toString() === likedPost.id);
        const user = (await helper.usersInDb(true))
            .find(user => user.username === 'chikuma');
        expect(entry.userId.toString()).toBe(user.id);
    });

    test('likedPostIds are unique', async () => {
        const likedPost = (await helper.postsInDb())[0];

        await api.put(`/api/post/like/${likedPost.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        await api.put(`/api/post/like/${likedPost.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const user = (await helper.usersInDb(true))
            .find(user => user.username === 'chikuma');
        const likes = (await helper.likesInDb())
            .filter(like => like.userId.toString() === user.id);
        expect(likes.length).toBe(1);
    });

    test('user unliked a post', async () => {
        const likedPost = (await helper.postsInDb())[0];

        await api.put(`/api/post/like/${likedPost.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        await api.delete(`/api/post/like/${likedPost.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const like = (await helper.likesInDb())
            .find(like => like.postId.toString() === likedPost.id);
        expect(like).toBe(undefined);
    });
});

describe('post operation, related to like collection', () => {
    let token = '';
    let likedPostId = '';

    beforeAll(async () => {
        await helper.clearAndCreatePosts();
        token = await loginUtil.loginUser();
        const likedPost = (await helper.postsInDb())[0];
        await api.put(`/api/post/like/${likedPost.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        likedPostId = likedPost.id;
    });

    test('delete post also delete related likes', async () => {
        await api.delete(`/api/post/${likedPostId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204);

        const likes = await helper.likesInDb();
        expect(likes.length).toBe(0);
    });
});