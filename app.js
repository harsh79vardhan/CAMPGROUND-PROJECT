const express=require('express');
const path=require('path');
const Joi = require('joi');
const review=require('./models/review')
const catchAsync=require('./utils/catchAsyncError');
const expressError=require('./utils/ExpressError')
const ejsMate=require('ejs-mate');
const Campground=require('./models/campground')
const methodOverride=require('method-override');
const campgrounds=require('./routes/campground')
const reviews=require('./routes/review')
const flash=require('connect-flash');
const session=require('express-session')
const userRoutes=require('./routes/users');
const LocalStrategy = require('passport-local').Strategy;
const passport=require('passport');
const User=require('./models/user');

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
const sessionConfig={
    httpOnly:true,
    secret:'thisisasecret',
    resave:false,
    saveUninitialized:true,
    cookies:{
        expires:Date.now() + 7*24*60*60*1000,
        maxAge:Date.now()
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// app.post('/campgrounds/reviews',async(req,res,next)=>{
//     const camp=await Campground.findById(req.params.id);
//     const rev=new review(req.body.Review);
//     console.log(camp);
//     camp.reviews.push(rev);
//     console.log(camp.reviews);
//     await camp.save();
//     await rev.save();
//     res.redirect(`/campgrounds/${camp._id}`);
// });

app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/user',userRoutes);

app.use('/campgrounds',campgrounds);

app.use('/campgrounds/reviews',reviews);



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