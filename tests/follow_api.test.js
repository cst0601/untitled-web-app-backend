//
// follow_api.test.js
// Tests for follow / unfollow a user.
//
// Created by Chikuma C., 05/14/2776 AUC
//
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

const helper = require('./test_helper');
const loginUtil = require('./login_util');

describe('follow / unfollow', () => {
    let token = '';

    beforeEach(async () => {
        await helper.clearAndCreatePosts();
        token = await loginUtil.loginUser();
    });

    test('follow a user success', async () => {
        const users = await helper.usersInDb();
        const followingUserId = users.find(
            user => user.username === 'sakuramiko35').id;

        await api
            .post(`/api/follow/${followingUserId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const userId = users.find(user => user.username === 'chikuma').id;
        const followers = await helper.getUserFollowers(userId);
        expect(followers).toHaveLength(1);
    });

    // follow ids should be unique
    test('failed if already followed', async () => {
        const users = await helper.usersInDb();
        const followingUserId = users.find(
            user => user.username === 'sakuramiko35').id;

        await api
            .post(`/api/follow/${followingUserId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        await api
            .post(`/api/follow/${followingUserId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const userId = users.find(user => user.username === 'chikuma').id;
        const followers = await helper.getUserFollowers(userId);
        expect(followers).toHaveLength(1);
    });

    test('failed if user id does not exist', async () => {
        await api
            .post(`/api/follow/${await helper.nonExistingUserId()}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    test('failed if not login', async () => {
        const user = (await helper.usersInDb()).find(
            user => user.username === 'sakuramiko35');

        await api
            .post(`/api/follow/${user.id}`)
            .expect(401);
    });

    // fail if follow self
    test('failed if following requesting user', async () => {
        const user = (await helper.usersInDb()).find(
            user => user.username === 'chikuma');

        await api
            .post(`/api/follow/${user.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    test('unfollow user', async () => {
        const users = (await helper.usersInDb());
        const unfollowUser = users.find(
            user => user.username === 'sakuramiko35');

        await api
            .post(`/api/follow/${unfollowUser.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        await api
            .delete(`/api/follow/${unfollowUser.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const userId = users.find(user => user.username === 'chikuma').id;
        const followers = await helper.getUserFollowers(userId);
        expect(followers).toHaveLength(0);
    });
});