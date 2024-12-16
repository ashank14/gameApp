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
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const userRouter = express_1.default.Router();
const SignupInput = zod_1.z.object({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters long"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
});
const SigninInput = zod_1.z.object({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters long"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long")
});
const prisma = new client_1.PrismaClient();
console.log("hello");
//signup
userRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = SignupInput.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: "incorrect input" });
        return;
    }
    //rest of the code
    const { username, email, password } = result.data;
    //check if username or email already exists
    const exists = yield prisma.user.findFirst({
        where: {
            OR: [
                { username: username },
                { email: email }
            ]
        }
    });
    if (exists) {
        res.status(400).json({ msg: "Username or email already exists" });
        return;
    }
    const newUser = yield prisma.user.create({
        data: req.body
    });
    const token = jsonwebtoken_1.default.sign(newUser.username, process.env.JWT_SECRET);
    res.json({
        msg: "signed up!",
        token: token
    });
    return;
}));
//signin
userRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = SigninInput.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: "Invalid input" });
        return;
    }
    const getUser = yield prisma.user.findUnique({
        where: {
            username: result.data.username,
            password: result.data.password
        }
    });
    if (!getUser) {
        res.status(400).json({ error: "Invalid username or password" });
        return;
    }
    const token = jsonwebtoken_1.default.sign(getUser.username, process.env.JWT_SECRET);
    res.json({
        msg: "signed in!",
        token: token
    });
    return;
}));
exports.default = userRouter;
