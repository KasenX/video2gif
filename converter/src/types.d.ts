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
    scale_x?: number;
    scale_y?: number;
    startTime?: number;
    duration?: number;
}
