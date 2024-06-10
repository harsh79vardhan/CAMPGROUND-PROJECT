const express=require('express');
const path=require('path');
const Joi = require('joi');
const review=require('./models/review')
const catchAsync=require('./utils/catchAsyncError');
const expressError=require('./utils/ExpressError')
const ejsMate=require('ejs-mate');
const Campground=require('./models/campground')
const methodOverride=require('method-override');

const mongoose = require('mongoose');
const { log } = require('console');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then(()=>{
    console.log('Connected to mongo');
})
.catch((err)=>{
    console.log('OOPS! Connection failed');
    console.log(err);
})
const app=express();
app.set('view engine','ejs');
app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_mehtod'));



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



app.get('/makecampground',catchAsync(async (req,res)=>{
    const camp=new Campground({
        title:'My home',
        description:'Very good house',
        price:12
    })
    await camp.save();
    res.send(camp);
}))

app.get('/',(req,res)=>{
    res.render('home');
})


app.get('/campgrounds/:id/delete',catchAsync(async (req,res)=>{
    const {id}=req.params;
     await Campground.findByIdAndDelete(id,{});
     res.redirect('/campgrounds');
 }))

app.get('/campgrounds', catchAsync(async (req,res)=>{
    try{
    let campgrounds= await Campground.find({});
    res.render('./campgrounds/index',{campgrounds});
    }catch(e){
        res.send("YOU GOT error");
    }
}))

app.get('/campgrounds/new',catchAsync((req,res)=>{
    console.log("HELLO");
    res.render('new');
}))

app.post('/campground/new',catchAsync(async(req,res,next)=>{
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
    
    const camp=req.body;
    await Campground.insertMany(camp);
    res.render('campgrounds/show',{camp})
}))

app.post('/campgrounds/:id/reviews/:reviewId',catchAsync(async(req,res,next)=>{
    
}))

app.get('/campgrounds/:id',catchAsync(async (req, res) => {
    let {id}=req.params;
    console.log(id);
    let camp = await Campground.findById(id).populate('reviews')
    console.log(camp);
    res.render('campgrounds/show',{camp});
}))

app.get('/campgrounds/:id/edit',catchAsync(async (req,res)=>{
    const {id}=req.params;
    let camp= await Campground.findById(id);
    console.log(camp);
    res.render('./campgrounds/edit',{camp});
}))

app.post('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const it = req.body;
    
    await Campground.findByIdAndUpdate(id, {
        title: it.title,
        price: it.price,
        location: it.location,
        description: it.description
    })
    const camp= await Campground.findById(id);
    console.log(camp);
    res.render('campgrounds/show',{camp})
}));

app.post('/campground/:id/review',async(req,res,next)=>{
    const camp=await Campground.findById(req.params.id);
    const rev=new review(req.body.Review);
    camp.reviews.push(rev);
    console.log(camp.reviews);
    await camp.save();
    await rev.save();
    res.redirect(`/campgrounds/${camp._id}`);
});



app.all('*',(req,res,next)=>{
    next(new expressError('Page not found',404));
    res.send("Error 404");
})

app.use((err,req,res,next)=>{
    if(!err.message) err.message='YOU GOT UNEXPECTED ERROR';
    if(!err.statusCode) err.statusCode=404;
    res.status(err.statusCode).render('error',{err});
})

app.listen(3000,()=>{
    console.log('Working on 3000');
})