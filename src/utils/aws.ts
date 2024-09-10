import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import type { DatabaseCredentials } from "../types/types";

const secret_name = "rds!db-66386ae9-73e6-4fa5-b606-04437acebac0";
const client = new SecretsManagerClient({
    region: "ap-southeast-2",
});

export const getDatabaseCredentials = async (): Promise<DatabaseCredentials> => {
    try {
        const response = await client.send(
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
