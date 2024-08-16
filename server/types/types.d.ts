import { JwtPayload } from "jsonwebtoken";

export interface User {
    id: number;
    email: string;
    password: string;
}

export interface JWTUserPayload extends JwtPayload {
    user: User;
}
