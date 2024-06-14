const express=require('express');
const router=express.Router();
const Joi = require('joi');
const catchAsync=require('../utils/catchAsyncError');
const expressError=require('../utils/ExpressError')
const User=require('../models/user');
const passport = require('passport');

router.post('/register',catchAsync(async(req,res,next)=>{
    const {username,email,password}=req.body;
    const user=new User({
        email:email,
        username:username
    })
    const registeredUser=await User.register(user,password);
    req.flash('success','Successfully registered!!');
    res.redirect('/campgrounds');
}))

router.get('/register',catchAsync((req,res,next)=>{
    res.render('../users/register');
}));


router.get('/login',async(req,res,next)=>{
    res.render('../users/login');
})

router.post('/login',passport.authenticate('local',{failureRedirect:'/user/login'}), async(req,res,next)=>{
    req.flash('success','Successfully logged in!!');
    res.redirect('/campgrounds');
})




module.exports = router;