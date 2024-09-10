import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import type { DatabaseCredentials, AWSParameters } from "../types/types";

const secret_name = "rds!db-66386ae9-73e6-4fa5-b606-04437acebac0";
const secret_client = new SecretsManagerClient({
    region: "ap-southeast-2",
});

export const getDatabaseCredentials = async (): Promise<DatabaseCredentials> => {
    try {
        const response = await secret_client.send(
            new GetSecretValueCommand({
                SecretId: secret_name
            })
        );
  
        if (response.SecretString) {
            return JSON.parse(response.SecretString);
        } else {
            throw new Error("SecretString is undefined");
        }
    } catch (error) {
        console.error("Error retrieving secrets", error);
        throw error;
    }
}

const parameter_client = new SSMClient({
    region: "ap-southeast-2",
});

export const getParameters = async (): Promise<AWSParameters> => {
    try {
        const command = new GetParametersCommand({
            Names: [
                '/n12134171/url',
                '/n12134171/rds/url',
                '/n12134171/rds/db_name'
            ]
        });
    
        const response = await parameter_client.send(command);
    
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
