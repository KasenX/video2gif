import type { Request, Response } from 'express';
import path from 'path';
import { generateAccessToken } from '../services/authService';
import { updatePreferences } from '../repositories/preferencesRepository';
import { getGifs } from '../services/gifService';
import { getPreferences } from '../services/preferencesService';

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
   const gifName = req.params.gifName;

   const gifPath = path.join(__dirname, '..', '..', 'gifs', `${gifName}`);

   res.sendFile(gifPath, (err) => {
       if (err) {
           console.error('Error serving the gif file', err);
           res.status(500).json({ error: 'Failed to serve the gif file' });
       }
   });
}
