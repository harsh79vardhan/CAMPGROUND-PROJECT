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



router.get('/new',catchAsync((req,res)=>{
    console.log("HELLO");
    res.render('new');
}))

router.get('/show/:id',catchAsync(async (req, res) => {
    let {id}=req.params;
    console.log(id);
    let camp = await Campground.findById(id).populate('reviews')
    console.log(camp);
    res.render('campgrounds/show',{camp});
}))

router.get('', catchAsync(async (req,res)=>{
    try{
    let campgrounds= await Campground.find({});
    res.render('./campgrounds/index',{campgrounds});
    }catch(e){
        res.send("YOU GOT error");
    }
}))


router.post('/new',catchAsync(async(req,res,next)=>{
    // const campgroundSchema=joi.object({
    //     Campground:joi.object({
    //         title:joi.string().required(),
    //         price:joi.number().required().min(0),
    //     }).required()
    // })
    // const {error}=campgroundSchema.validate(req.body);
    // console.log(error);
    // if (error) {
    //     const mssg = error.details.map(el => el.message).join(',');            throw new expressError(mssg, 400);
    // }
    
    const camp=new Campground(req.body);
    await camp.save();
    req.flash('success','Successfully created the campground!!');
    res.redirect(`/campgrounds/show/${camp._id}`)
}))


router.get('/:id/edit',catchAsync(async (req,res)=>{
    const {id}=req.params;
    let camp= await Campground.findById(id);
    console.log(camp);
    res.render('./campgrounds/edit',{camp});
    }))


    
    
    router.post('/:id/edit', catchAsync(async (req, res) => {
        const { id } = req.params;
        const it = req.body;
        
        await Campground.findByIdAndUpdate(id, {
            title: it.title,
            price: it.price,
            location: it.location,
            description: it.description
            })
            const camp= await Campground.findById(id);
            req.flash('success','Successfully updated the campground!!');
            res.redirect(`/campgrounds/show/${id}`)
            }));

            router.get('/:id/delete',catchAsync(async (req,res)=>{
                const {id}=req.params;
                 await Campground.findByIdAndDelete(id,{});
                 req.flash('success','Successfully deleted the campground!!');
                 res.redirect('/campgrounds');
             }))
            
            router.get('show/:id',catchAsync(async (req, res) => {
                    let {id}=req.params;
                    console.log(id);
                    let camp = await Campground.findById(id).populate('reviews')
                    console.log(camp);
                    res.render('campgrounds/show',{camp});
                }))







module.exports=router;