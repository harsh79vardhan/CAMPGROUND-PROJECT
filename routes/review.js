const express=require('express');
const router=express.Router();
const Joi = require('joi');
const review=require('../models/review')
const catchAsync=require('../utils/catchAsyncError');
const expressError=require('../utils/ExpressError')
const Campground=require('../models/campground')

const validateCampground = (req, res, next) => {
    console.log(req.body);
    const campgroundSchema = Joi.object({
        Campground: Joi.object({
            title: Joi.string().required(),
            location: Joi.string().required(),
            image: Joi.string().required(),
            price: Joi.number().required().min(0),
            description: Joi.string().required()
        }).required()
    });

    const { error } = campgroundSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const mssg = error.details.map(el => el.message).join(',');
        throw new expressError(mssg, 400);
    } else {
        next();
    }
}



router.post('/:id',async(req,res,next)=>{
    const camp=await Campground.findById(req.params.id);
    const rev=new review(req.body.Review);
    console.log(camp);
    camp.reviews.push(rev);
    console.log(camp.reviews);
    await camp.save();
    await rev.save();
    req.flash('success','Successfully created review!!');
    res.redirect(`/campgrounds/show/${camp._id}`);
});

router.post('/:id/:reviewId',catchAsync(async(req,res,next)=>{
    const {id,reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviewId}});
    await review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review!!');
    res.redirect(`/campgrounds/show/${id}`);
}))

module.exports=router