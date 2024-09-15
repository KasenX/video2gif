import type { Request, Response } from 'express';
import path from 'path';
import { generateAccessToken } from '../services/authService';
import { signUp, confirmSignUp } from '../services/authService';
import { updatePreferences } from '../repositories/preferencesRepository';
import { getGifs } from '../services/gifService';
import { getPreferences } from '../services/preferencesService';
import { generatePreSignedUrl } from '../services/awsService';

export const signUpGet = (req: Request, res: Response) => {
   res.render("signup");
}

export const signUpPost = async (req: Request, res: Response) => {
   const { email, password } = req.body;

   await signUp(email, password);

   res.redirect(`/confirm?email=${encodeURIComponent(email)}`);
}

export const confirmGet = (req: Request, res: Response) => {
   const { email } = req.query;
    res.render('confirm', { email });
}

export const confirmPost = async (req: Request, res: Response) => {
   const { email, code } = req.body;

   await confirmSignUp(email, code);

   res.redirect("/");
}

export const loginGet = (req: Request, res: Response) => {
   res.render("login");
}

export const loginPost = async (req: Request, res: Response) => {
   const { email, password } = req.body;

   const token = await generateAccessToken(email, password);

   if (!token) {
      return res.sendStatus(401);
   }
 
   res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "strict",
   });
 
   res.redirect("/");
}

export const logout = (req: Request, res: Response) => {
   res.clearCookie("authToken");
   res.redirect("/login");
}

export const home = async (req: Request, res: Response) => {
   if (!req.user) {
      return res.sendStatus(500);
   }

   const preferences = await getPreferences(req.user.id);

   res.render("home", {
      email: req.user.email,
      fps: preferences.fps,
      scale_x: preferences.scale_x === -1 ? "Auto" : preferences.scale_x,
      scale_y: preferences.scale_y === -1 ? "Auto" : preferences.scale_y,
      startTime: 0,
      duration: "",
      authToken: req.cookies.authToken,
   });
}

export const gallery = async (req: Request, res: Response) => {
   if (!req.user) {
      return res.sendStatus(500);
   }

   const gifs = await getGifs(req.user.id);

   res.render("gallery", {
      gifs: gifs,
   });
}

export const profileGet = async (req: Request, res: Response) => {
   if (!req.user) {
      return res.sendStatus(500);
   }

   const preferences = await getPreferences(req.user.id);

   res.render("profile", {
      email: req.user.email,
      fps: preferences.fps,
      scale_x: preferences.scale_x === -1 ? "Auto" : preferences.scale_x,
      scale_y: preferences.scale_y === -1 ? "Auto" : preferences.scale_y,
   });
}

export const profilePost = async (req: Request, res: Response) => {
   if (!req.user) {
      return res.sendStatus(500);
   }

   const { fps, scale_x, scale_y } = req.body;

   await updatePreferences(req.user.id, {
      fps: fps,
      scale_x: scale_x === "Auto" ? -1 : scale_x,
      scale_y: scale_y === "Auto" ? -1 : scale_y,
   });

   res.redirect("/");
}

export const gif = async (req: Request, res: Response) => {
   const gifId = req.params.gifId as string;

   const preSignedUrl = await generatePreSignedUrl(gifId);
   res.redirect(preSignedUrl);
}
