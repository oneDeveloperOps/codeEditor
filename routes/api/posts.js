const express = require('express');
const route = express.Router();
const Post = require('../../models/Post');
const auth = require('../../middleware/auth');
const { check , validationResult } = require('express-validator');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
//@route Post /api/posts
//post
//access private
route.post('/' ,[auth , [
    check('text' , "Text must be not empty").not().isEmpty()
]], async (req , res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(401).json({ errors: errors.array() });
    try {
        const user = await User.findOne({ _id: req.user.id }).select('-password');
        console.log(user)
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });
        const post = await newPost.save();
        res.json(post);
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Something went wrong");
    }
});

//@access private
//@route api/posts
// get all posts
route.get('/' , auth , async(req , res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
});



//@access private
//@route api/posts/:id
// get posts by id
route.get('/:id' , auth , async(req , res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id });
        if(!post) return res.status(404).json({ msg: "Not found" });
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
});

//@access private
//@route api/posts/:id
// Delete post
route.delete('/:id' , auth , async(req , res) => {
    try {
        const post = await Post.findOne({_id: req.params.id });
        //post.user is objectId so convertd into string to match with userid
        if(post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to delete post' })
        }
        post.remove();
        res.json({ msg: 'Post removed'});
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
});


//@access private
//@route api/posts/likes/:id
// Like post
route.put('/likes/:id' , auth , async(req , res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id });
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: "Post already liked"});
        }
        post.likes.unshift({ user: req.user.id });
        await post.save()
        res.json(post.likes)
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
});


//@access private
//@route api/posts/unlike/:id
// UnLike post
route.put('/unlike/:id' , auth , async(req , res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id });
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: "Post not liked"});
        }
        const indexToBeremoved = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(indexToBeremoved , 1);
        await post.save()
        res.json(post.likes)
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
});

//@route Post /api/posts/comments/:id
//post
//access private
route.post('/comments/:id' ,[auth , [
    check('text' , "Text must be not empty").not().isEmpty()
]], async (req , res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(401).json({ errors: errors.array() });
    try {
        const user = await User.findOne({ _id: req.user.id }).select('-password');
        const post = await Post.findOne({ _id: req.params.id });

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };
        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Something went wrong");
    }
});

//@route Post /api/posts/comments/:id/:comment_id
//delete
//access private


route.delete('/comments/:id/:comment_id' , auth , async(req , res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id });
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if(!comment) {
            return res.status(404).json({ msg: "Comment not found" });
        }
        //check the user
        if(comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to delete comment' })
        }
        const indexToBeremoved = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(indexToBeremoved , 1);
        await post.save()
        res.json(post.comments)
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
        
    }
});

 
module.exports = route;