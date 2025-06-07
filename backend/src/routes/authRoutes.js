import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "15d"});
}
router.post("/register", async (req, res) => {
    try {
        const {email, username, password} = req.body;
        if(!username || !email || !password){
            return res.status(400).json({message: "All fields are required!"});
        }
        if(password.length < 6){
            return res.status(400).json({message:"Password should be atleast 6 characters long!"});
        }
        if(username.length < 3){
            return res.status(400).json({message:"Username should be atleast 3 characters long!"});
        }
        //Check if Email & User Already existed
        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({message:"Email already existed!"});
        }
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(400).json({message:"Username already existed!"});
        }
        //Get RandomAvatar
        const profileImage = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${username}`
        const user = new User({
            email,
            username,
            password,
            profileImage
        });
        await user.save();

        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user:{
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.log("Error in Register route", error);
        return res.status(500).json({message:"Internal Server Error!"});
    }
});
router.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) return res.status(400).json({message:"All fields are required!"});
        //Check if user exists
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message:"Invalid Credentials!"});
        //check if password correct
        const isPasswordCorrect = await user.comparePassword(password);
        if(!isPasswordCorrect) return res.status(400).json({message:"Invalid Credentials!"});
        
        const token = generateToken(user._id);
        res.status(200).json({
            token,
            user:{
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.log("Error in Login route", error);
        res.status(500).json({message:"Internal server error!"});
    }
});
export default router;