export interface User {
    id: string;
    email: string;
}

export interface AWSSecrets {
    dbUser: string,
    dbPassword: string,
}

export interface AWSParameters {
    url: string;
    dbHost: string;
    dbName: string;
}

export interface VideoConversionBody {
    fps?: number;
    scaleX?: number;
    scaleY?: number;
    startTime?: number;
    duration?: number;
}
