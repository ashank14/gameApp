import express,{ Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import {z} from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const userRouter=express.Router();

const SignupInput = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  });

const SigninInput=z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long")
})
type Signup=z.infer<typeof SignupInput>;
type Signin=z.infer<typeof SigninInput>;

const prisma=new PrismaClient();
console.log("hello");

//signup
userRouter.post('/signup',async (req:Request,res:Response) =>{
    const result = SignupInput.safeParse(req.body);

    if(!result.success){
         res.status(400).json({error:"incorrect input"});
         return;
    }
    //rest of the code
    const {username,email,password}=result.data;
    //check if username or email already exists
    const exists=await prisma.user.findFirst({
        where:{
            OR:[
                {username:username},
                {email:email}
            ]
        }
    });
    if(exists){
        res.status(400).json({msg:"Username or email already exists"});
        return;
    }

    const newUser=await prisma.user.create({
        data:req.body
    });

    const token=jwt.sign(newUser.username,process.env.JWT_SECRET as string);

    res.json({
        msg:"signed up!",
        token:token
    })

    return;
});

//signin

userRouter.post('/signin',async (req:Request,res:Response)=>{
    const result=SigninInput.safeParse(req.body);

    if(!result.success){
        res.status(400).json({error:"Invalid input"});
        return;
    }

    const getUser=await prisma.user.findUnique(
        {
            where:{
                username:result.data.username,
                password:result.data.password
            }
        }
    );

    if(!getUser){
        res.status(400).json({error:"Invalid username or password"});
        return;
    }

    const token=jwt.sign(getUser.username,process.env.JWT_SECRET as string);

    res.json({
        msg:"signed in!",
        token:token
    })

    return;

});


export default userRouter;