//
// search_api.test.js
// Test search related operations, uri starts with /api/serach
//
// Created by Chikuma C., 10/11/2776 AUC
//
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

const helper = require('./test_helper');

// failed for some reason, search controller does not return any results, but
// works when normally ran.
describe('request search of post', () => {
    let expectPost = null;

    beforeAll(async () => {
        await helper.clearAndCreatePosts();
        expectPost = (await helper.postsInDb()).find(
            post => post.context === 'Post context, here users fill this with' +
                ' some random text. For most of the times posts are meaningle' +
                'ss.'
        );
    });

    test('search sucessfully', async () => {
        const response = await api
            .get('/api/search/post')
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const searchResult = response.body[0];
        console.log(response.body);
        console.log(searchResult);
        console.log(expectPost);

        expect(searchResult.user.id).toEqual(expectPost.user.toString());
        expect(searchResult.context).toBe(expectPost.context);
    });
});