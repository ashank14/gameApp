import {z} from 'zod';

export const SignupInput = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  });

export const SigninInput=z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long")
})

export type Signup=z.infer<typeof SignupInput>;
export type Signin=z.infer<typeof SigninInput>;