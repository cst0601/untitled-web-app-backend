//
// post.js
// Post handler module, uri starts with /api/post.
//
// Created by Chikuma C., 05/12/2776 AUC
//
const postRouter = require('express').Router();

const { param } = require('express/lib/router');
const Post = require('../models/post');
const User = require('../models/user');

postRouter.get('/:id', async (request, response) => {
    const post = await Post
        .findById(request.params.id)
        .populate('user', { username: 1, displayName: 1 });

    if (post) response.json(post);
    else response.status(404).json({
        error: 'post does not exist or deleted.'
    });
});

postRouter.post('/', async (request, response) => {
    const body = request.body;
    const user = await User.findById(response.locals.userId);

    const post = new Post({
        user: user.id,
        context: body.context,
    });
    await post.save();
    const savedPost = await post.populate('user', { displayName: 1, username: 1 });
    response.status(201).json(savedPost);
});

postRouter.delete('/:id', async (request, response) => {
    // check if the post is created by user
    const postUserId = (await Post.findById(request.params.id)).user.toString();
    const requestUserId = response.locals.userId;
    if (postUserId !== requestUserId) {
        return response.status(401).json({
            error: 'does not have the priviledge to delete this post',
        });
    }

    await Post.findByIdAndDelete(request.params.id);
    response.status(204).end();
});

postRouter.put('/like/:id', async (request, response) => {
    const user = await User.findById(response.locals.userId);
    const post = await Post.findById(request.params.id);

    if (!post) response.status(404).json({ error: 'post not found.' });

    // mongodb / mongoose currently have problem ensuring array containing
    // unique values, therefore, ensure uniqueness in application instead.
    // (Which is a bad idea).
    if (user.likedPostIds.indexOf(request.params.id) === -1)
        user.likedPostIds.push(request.params.id);
    await user.save();

    response.status(200).end();
});

postRouter.delete('/like/:id', async (request, response) => {
    const user = await User.findById(response.locals.userId);

    user.likedPostIds = user.likedPostIds.filter(
        id => id.toString() !== request.params.id);
    await user.save();

    response.status(200).end();
});

module.exports = postRouter;