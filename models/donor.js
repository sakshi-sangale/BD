const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DonorSchema = new Schema({
    firstName:String,
    lastName:String,
    dob:String,
    age:Number,
    bloodGroup:String,
    weight:Number,
    gender:String,
    eMail:String,
    phoneNo:Number,
    address:String,
    firstNameC:String,
    lastNameC:String  
    
});


module.exports = mongoose.model('donor', DonorSchema);