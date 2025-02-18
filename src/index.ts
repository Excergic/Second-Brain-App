import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ContentModel, UserModel } from './db';
import { JWT_SECRET } from './config';
import { userMiddleware } from './middleware';
const PORT = 3000;

const app = express();
app.use(express.json());

app.post("/api/v1/signup", async (req, res) : Promise<any> => {
    //zod validation
    const { username, password } = req.body;

    const userExists = await UserModel.findOne({ username });
    if(userExists){
        return res.status(400).json({message: "User already exists"});
    }

    const newUser = new UserModel({ username, password });
    await newUser.save();

    res.json({
        message : "You are singup!"
    });
});

app.post("/api/v1/login", async (req, res) : Promise<any> =>{
    const { username, password } = req.body;
    try{
        const existingUser = await UserModel.findOne({ username });
    if(!existingUser){
        return res.status(401).json({error : "Invalid Credentials!"});
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if(!isMatch){
        return res.status(401).json({error : "invalid credentials!"});
    }

    // token and payload
    const token = jwt.sign({
        id : existingUser._id,
        username : existingUser.username
    }, JWT_SECRET);

    res.json({
        token,
        message: "You are signin!"
    });
    
    }catch(error){
        console.log(error);
        res.status(500).send("Server error");
    }

    
})

app.post("/api/v1/content", userMiddleware, async (req, res) : Promise<any> => {
    const { title, link, type } = req.body;
    const newContent =  new ContentModel({
        title,
        link,
        type,
        //@ts-ignore
        userId : req.userId,
        tags: []
    });

    await newContent.save();

    res.json({
        message : "content Added"
    });
})

app.get("/api/v1/content", userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId; 
    const content = await ContentModel.find({
        userId : userId,   
    }).populate("userId" ,"username");

    res.json({
        content
    })
})

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;
    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId : req.userId
    })

    res.json({
        message : "Content Deleted"
    });
})

app.post("/api/v1/brain/share", (req, res) => {

})

app.get("/api/v1/brain/:sharelink", (req, res) => {
    
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})