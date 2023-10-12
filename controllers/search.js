//
// search.js
// Post search.
//
// Created by Chikuma C., 09/07/2776 AUC
//
const searchRouter = require('express').Router();

const Post = require('../models/post');

searchRouter.get('/:query', async (request, response) => {
    const posts = await Post
        .aggregate([
            {
                $search: {
                    index: 'post_index',
                    text: {
                        query: request.params.query,
                        path: {
                            wildcard: '*'
                        }
                    }
                }
            },
            { $addFields: { id: '$_id' } },
            { $unset: ['_id', '__v'] }
        ]);
    await Post.populate(
        posts, 'user', { username: 1, displayName: 1 });

    return response.status(200).json(posts);
});

module.exports = searchRouter;