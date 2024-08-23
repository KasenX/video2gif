import { JwtPayload } from "jsonwebtoken";

export interface User {
    id: number;
    email: string;
    password: string;
}

export interface JWTUserPayload extends JwtPayload {
    user: User;
}

export interface VideoConversionBody {
    fps?: number;
    scale_x?: number;
    scale_y?: number;
    startTime?: number;
    duration?: number;
}