import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import type { AWSSecrets, AWSParameters } from "../types/types";

const rdsSecretName = "rds!db-66386ae9-73e6-4fa5-b606-04437acebac0";
const secretClient = new SecretsManagerClient({
    region: "ap-southeast-2",
});

export const getSecrets = async (): Promise<AWSSecrets> => {
    try {
        const response = await secretClient.send(
            new GetSecretValueCommand({
                SecretId: rdsSecretName
            })
        );
  
        const rdsSecrets = response.SecretString ? JSON.parse(response.SecretString) : undefined;

        if (!rdsSecrets) {
            throw new Error("RDS SecretString is undefined");
        }

        return {
            dbUser: rdsSecrets.username,
            dbPassword: rdsSecrets.password
        };

    } catch (error) {
        console.error("Error retrieving secrets", error);
        throw error;
    }
}

const parametersNames = [
    '/n12134171/url',
    '/n12134171/rds/url',
    '/n12134171/rds/db_name'
];
const parameterClient = new SSMClient({
    region: "ap-southeast-2",
});

export const getParameters = async (): Promise<AWSParameters> => {
    try {
        const command = new GetParametersCommand({
            Names: parametersNames
        });
    
        const response = await parameterClient.send(command);
    
        if (!response.Parameters || response.Parameters.length !== 3) {
          throw new Error("Invalid number of parameters");
        }
    
        const params = response.Parameters.reduce((acc, param) => {
            if (!param.Name || !param.Value) {
                throw new Error("Invalid parameter");
            }

            acc[param.Name] = param.Value;
            return acc;
        }, {} as Record<string, string>);
    
        return {
            url: params['/n12134171/url'] as string,
            dbHost: params['/n12134171/rds/url'] as string,
            dbName: params['/n12134171/rds/db_name'] as string,
        };
    } catch (error) {
        console.error("Error retrieving parameters", error);
        throw error;
    }
}
