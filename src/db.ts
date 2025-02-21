import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
mongoose.connect("mongodb+srv://dhaivatjambudia:szC3I7gAX5FRCc1a@cluster0.2bejr.mongodb.net/Second-Brain");

const UserSchema = new mongoose.Schema({
    username : {
        type: String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    }
});



//Password Hash logic
UserSchema.pre('save', async function(next) {
    const user = this;
    if(user.isModified('password')){
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
    next();
});

export const UserModel = mongoose.model('User', UserSchema);

const ContentSchema = new mongoose.Schema({
    title : String,
    link : String,
    type: String,
    tags : [{type : mongoose.Types.ObjectId, ref : 'Tag'}],
    userId : {type : mongoose.Types.ObjectId, ref : 'User', required : true},
    sharelink : {
        type : String,
        unique : true,
        sparse : true , // Allows null values without unique constraint issue
           
    }
});

export const ContentModel = mongoose.model("Content", ContentSchema);