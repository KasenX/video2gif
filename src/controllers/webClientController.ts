import type { Request, Response } from 'express';
import { generateAccessToken } from '../services/authService';
import { findPreferences, updatePreferences } from '../repositories/preferencesRepository';

export const loginGet = (req: Request, res: Response) => {
   res.render("login");
}

export const loginPost = (req: Request, res: Response) => {
   const { email, password } = req.body;

   const token = generateAccessToken(email, password);

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

   const preferences = await findPreferences(req.user.id);

   if (!preferences) {
      return res.sendStatus(500);
   }

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

export const profileGet = async (req: Request, res: Response) => {
   if (!req.user) {
      return res.sendStatus(500);
   }

   const preferences = await findPreferences(req.user.id);

   if (!preferences) {
      return res.sendStatus(500);
   }

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
