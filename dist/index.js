"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db");
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const PORT = 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //zod validation
    const { username, password } = req.body;
    const userExists = yield db_1.UserModel.findOne({ username });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }
    const newUser = new db_1.UserModel({ username, password });
    yield newUser.save();
    res.json({
        message: "You are singup!"
    });
}));
app.post("/api/v1/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const existingUser = yield db_1.UserModel.findOne({ username });
        if (!existingUser) {
            return res.status(401).json({ error: "Invalid Credentials!" });
        }
        const isMatch = yield bcrypt_1.default.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({ error: "invalid credentials!" });
        }
        // token and payload
        const token = jsonwebtoken_1.default.sign({
            id: existingUser._id,
            username: existingUser.username
        }, config_1.JWT_SECRET);
        res.json({
            token,
            message: "You are signin!"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Server error");
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, link, type } = req.body;
    const newContent = new db_1.ContentModel({
        title,
        link,
        type,
        //@ts-ignore
        userId: req.userId,
        tags: []
    });
    yield newContent.save();
    res.json({
        message: "content Added"
    });
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const content = yield db_1.ContentModel.find({
        userId: userId,
    }).populate("userId", "username");
    res.json({
        content
    });
}));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
