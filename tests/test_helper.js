const bcrypt = require('bcrypt');
const User = require('../models/user');
const Post = require('../models/post');

const initialUsers = [
    {
        username: 'chikuma',
        displayName: 'Chikuma',
        password: '123456789',
    },
    {
        username: 'sakuramiko35',
        displayName: 'さくらみこ',
        password: '123456789',
    }
];

const usersInDb = async () => {
    const users = await User.find({});
    return users.map(user => user.toJSON());
};

const nonExistingUserId = async () => {
    const user = new User ({
        username: 'nonExistUser',
        displayName: 'displayName',
        passwordHash: 'password_1234',
    });

    await user.save();
    await user.deleteOne();

    return user._id.toString();
};

const getUserFollowers = async (userId) => {
    const user = await User.findById(userId);
    const followerIds = user.followedUserIds.map(id => id.toString());
    return followerIds;
};

const clearAndCreateUsers = async () => {
    await User.deleteMany({});

    await Promise.all(initialUsers.map(async user => {
        const passwordHash = await bcrypt.hash(user.password, 10);
        const newUser = new User({
            username: user.username,
            displayName: user.displayName,
            passwordHash: passwordHash
        });
        await newUser.save();
    }));
};

// ---------- POST RELATED INITIALIZATIONS ----------

const initialPosts = [
    {
        context:
            'Post context, here users fill this with some random text.' +
            ' For most of the times posts are meaningless.',
        likes: 15,
    },
    {
        context: 'にゃっはろ～',
        likes: 35,
    },
];

const postsInDb = async () => {
    const posts = await Post.find({});
    return posts.map(post => post.toJSON());
};

const nonExistingPostId = async (userId) => {
    const post = new Post({
        user: userId,
        context: 'post will be deleted',
        likes: 10,
    });
    await post.save();
    await post.deleteOne();

    return post._id.toString();
};

// Clears posts in DB and create new posts from initialPosts.
// The function will call clearAndCreteUsers as posts requires user id.
const clearAndCreatePosts = async () => {
    await clearAndCreateUsers(); // need to first have users
    await Post.deleteMany({});

    const user = await User.findOne({ username: 'chikuma' });
    await Promise.all(initialPosts.map(async post => {
        const newPost = new Post({
            user: user,
            context: post.context,
            likes: post.likes,
        });
        await newPost.save();
    }));
};

module.exports = {
    usersInDb,
    nonExistingUserId,
    clearAndCreateUsers,
    getUserFollowers,
    postsInDb,
    nonExistingPostId,
    clearAndCreatePosts,
};