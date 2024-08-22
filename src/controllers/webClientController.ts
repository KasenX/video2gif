import type { Request, Response } from 'express';
import path from 'path';
import { generateAccessToken } from '../services/authService';

export const loginGet = (req: Request, res: Response) => {
   res.sendFile(path.join(__dirname, "../../public/login.html"));
}

export const loginPost = (req: Request, res: Response) => {
   const { email, password } = req.body;

   console.log(req.body);
   console.log(email, password);

   const token = generateAccessToken(email, password);

   if (!token) {
      return res.sendStatus(401);
   }
 
   res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
   });
 
   res.redirect("/");
}

export const logout = (req: Request, res: Response) => {
   res.clearCookie("token");
   res.redirect("/login");
}

export const home = (req: Request, res: Response) => {
   res.sendFile(path.join(__dirname, "../../public/index.html"));
}
