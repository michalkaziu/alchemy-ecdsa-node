import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { bytesToHex, utf8ToBytes } from "ethereum-cryptography/utils";

export function getAddress(privateKey)
{
    if (privateKey.length != 64)
        return "";

    const publicKey    = secp256k1.getPublicKey(privateKey);
    const addressBytes = keccak256(publicKey.slice(1).slice(-20));

    return `0x${bytesToHex(addressBytes)}`;
}

export function getDataHash(sender, recipient, amount)
{
    const dataObj = {
        sender: sender,
        recipient: recipient, 
        amount: amount,
    };
    const dataJson = JSON.stringify(dataObj);

    return keccak256(utf8ToBytes(dataJson));
}

export function sign(recipient, amount, privateKey)
{
    const dataHash   = getDataHash(getAddress(privateKey), recipient, amount);
    const signedData = secp256k1.sign(dataHash, privateKey).addRecoveryBit(0);
    const signedHex  = signedData.toCompactHex();
    
    //console.log("[sign|signedHex]: " + signedHex);

    return signedHex;
}

export function verify(signature, sender, recipient, amount)
{
    const dataHash   = getDataHash(sender, recipient, amount);
    const signedData = secp256k1.Signature.fromCompact(signature).addRecoveryBit(0);
    const publicKey  = signedData.recoverPublicKey(dataHash);
    const isSigned   = secp256k1.verify(signedData, dataHash, publicKey.toRawBytes());
    
    //console.log("[verify|isSigned]: " + isSigned);
    
    return isSigned;
}