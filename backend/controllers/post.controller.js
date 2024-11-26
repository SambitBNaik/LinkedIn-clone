import cloudinary from "../lib/cloudinary.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";


export const getFeedPosts = async(req, res)=>{
    try {
        const posts = await Post.find({ author: { $in: [...req.user.connections, req.user._id] }})
        .populate("author","name username profilePicture headline")
        .populate("comments.user","name profilePicture")
        .sort({createdAt:-1});

        res.status(200).json(posts);
    } catch (error) {
        consolel.error("Error in getFeedPosts controller", error);
        res.status(500).json({ message: "Server error"});
    }
}

export const createPost = async(req , res)=>{
    try {
        const {content, image}= req.body;
        let newPost;
        if(image){
            const imageResult = await cloudinary.uploader.upload(image);
            newPost= new Post({
                author: req.user._id,
                content,
                image:imageResult.secure_url,
            });
        }else{
            newPost= new Post({
                author:req.user._id,
                content,
            })
        }
        await newPost.save();

        res.status(201).json(newPost);
    } catch (error) {
        console.error("Error in createPost controller",error);
        res.status(500).json({message:"Server Error"});
    }
};

export const deletePost = async( req, res)=>{
    try {
        const postId= req.params.id;
        const userId= req.user._id;

        console.log("postId",postId);
        console.log("userId",userId);

        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({ message:"Post not found"});
        }

        // check if the current user is the author of the post
        if(post.author.toString()!==userId.toString()){
            return res.status(403).json({ message:"You are not authorized to delete this post"});
        }

        //delete the image from the cloudinary
        if(post.image){
            await cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0]);
        }
        
        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message:"Post deleted successfully"});
        
    } catch (error) {
        console.error("Error in delete post controller",error.message);
        res.status(500).json({message:"Server error"});
    }
}


export const getPostById = async(req, res)=>{
    try {
        const postId= req.params.id;
        const post = Post.findById(postId)
        .populate("author","name username profilePicture headline")
        .populate("comments.user","name profilePicture username headline");

        res.status(200).json(post);
    } catch (error) {
        console.error("Error in getPostById controller", error);
        res.status(500).json({ message: "Server error"});
    }
}

export const  createComment= async(req, res)=>{
    try {
        const postId= req.params.id;
        const {content}= req.body;
        
        const post= await Post.findByIdAndUpdate(
            postId,
            {
                $push:{ comments: {user: req.user._id, content } },
            },
            {new : true}
        ).populate("author", "name email username headline profilePicture");

        // create a notification if the comment is not the post owner
        if(post.author._id.toString()!== req.user._id.toString()){
            const newNotificaion= new Notification({
                recipient: post.author,
                type:"comment",
                relatedUser:req.user._id,
                relatedPost: postId,
            });

            await newNotificaion.save();

            try {
                const postUrl = process.env.CLINT_URL+"/post"+postId;
                await sendCommentNotificationEmail(
                    post.author.email,
                    post.author.name,
                    req.user.name,
                    postUrl,
                    content
                );
            } catch (error) {
                console.log("Error in sending comment notification email:", error);   
            }
        }
        res.status(200).json(post);
    } catch (error) {
        console.error("Error in createComment controller", error.message);
        res.status(500).json({message: "Server error"});
    }
}

export const likePost = async(req, res)=>{
    try {
        const postId= req.params.id;
        const post = await Post.findById(postId);
        const userId= req.user._id;

        if(post.likes.includes(userId)){
            // unlike post
            post.likes=post.likes.filter((id)=>id.toString() !==userId.toString());
        }else{
            //like post
            post.likes.push(userId);
            //create notification if the post owner is not the user who liked
            if(post.author.toString!==userId.toString()){
                const newNotificaion= new Notification({
                    recipient:post.author,
                    type:"like",
                    relatedUser:userId,
                    relatedPost:postId,
                });

                await newNotificaion.save();
            }
        }

        await post.save();

        res.status(200).json(post);
    } catch (error) {
        console.error("Error in likePost controller", error.message);
        res.status(500).json({message:"Server Error"});
    }
}