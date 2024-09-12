import { 
    CognitoIdentityProviderClient,
    SignUpCommand,
    ConfirmSignUpCommand,
    InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { User } from '../types/types';

const userPoolId = 'ap-southeast-2_aV7Yy8hyg'
const clientId = '2m3luc6efvd7l8gml8tv4gtnt1'

const idVerifier = CognitoJwtVerifier.create({
    userPoolId: userPoolId,
    tokenUse: 'id',
    clientId: clientId
});

export const authenticateToken = async (token: string): Promise<User | false> => {
    try {
        const idToken = await idVerifier.verify(token);

        return {
            id: idToken.sub,
            email: idToken.email as string
        }
    }
    // Authentication failed
    catch (e) {
        return false;
    }
};

export const generateAccessToken = async (email: string, password: string): Promise<string | false> => {
    try {
        const client = new CognitoIdentityProviderClient({ region: 'ap-southeast-2'});
        const command = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            },
            ClientId: clientId
        });
        const res = await client.send(command);
        return res.AuthenticationResult?.IdToken ?? false;
    } 
    // Authentication failed
    catch (e) {
        return false;
    }
}

export const signUp = async (email: string, password: string): Promise<void> => {
    const client = new CognitoIdentityProviderClient({ region: 'ap-southeast-2'});
    const command = new SignUpCommand({
        ClientId: clientId,
        Username: email,
        Password: password
    });
    const res = await client.send(command);
    console.log(res);
}

export const confirmSignUp = async (email: string, code: string): Promise<void> => {
    const client = new CognitoIdentityProviderClient({ region: 'ap-southeast-2'});
    const command = new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: email,
        ConfirmationCode: code
    });
    const res = await client.send(command);
    console.log(res);
}
