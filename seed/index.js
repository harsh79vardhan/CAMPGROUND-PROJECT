const cities=require('./cities');
const Campground=require('../models/campground');
const { places,descriptors }=require('./seedhelper');

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then(()=>{
    console.log('Connected to mongo');
})
.catch((err)=>{
    console.log('OOPS! Connection failed');
    console.log(err);
})

const sample=array=>array[Math.floor(Math.random()*array.length)];
console.log(places);
const seedDB = async ()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const rand100=Math.floor(Math.random()*100);
        const price=Math.floor(Math.random()*1000);
        const camp=new Campground({
            location:`${cities[rand100].name}, ${cities[rand100].state}`,
            title:`${sample(places)} ${sample(descriptors)}`,
            image:'https://picsum.photos/200',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius enim mollitia natus recusandae veniam, quo asperiores corporis illo libero ipsum, impedit unde numquam! Iure nisi deserunt ipsum pariatur delectus explicabo!',
            price:price
        })
        await camp.save();
    }
}
seedDB();