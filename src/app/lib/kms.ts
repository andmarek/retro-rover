import { KMSClient, DecryptCommand, EncryptCommand } from "@aws-sdk/client-kms";

export async function decryptData(ciphertextBlob: string, keyId: string) {
  const client = new KMSClient({ region: "us-east-1" });


  const command = new DecryptCommand({
    KeyId: keyId,
    CiphertextBlob: new Uint8Array(Buffer.from(ciphertextBlob, 'base64')),
  });
  const kmsResponse = await client.send(command);
  const decryptedData = new TextDecoder().decode(kmsResponse.Plaintext);
  return decryptedData;
}

export async function encryptData(plaintext: string, keyId: string) {
  const client = new KMSClient({ region: "us-east-1" });

  const command = new EncryptCommand({
    KeyId: keyId,
    Plaintext: new Uint8Array(Buffer.from(plaintext)),
  });
  const encryptedBlob = await client.send(command);
  const buff = Buffer.from(encryptedBlob.CiphertextBlob);
  const encryptedBase64Data = buff.toString("base64");
  return encryptedBase64Data;
}
