const { secp256k1 }  = require( "ethereum-cryptography/secp256k1");
const { keccak256 }  = require( "ethereum-cryptography/keccak");
const { bytesToHex, utf8ToBytes }  = require( "ethereum-cryptography/utils");

function getAddress(privateKey)
{
    const publicKey    = secp256k1.getPublicKey(privateKey);
    const addressBytes = keccak256(publicKey.slice(1).slice(-20));

    return `0x${bytesToHex(addressBytes)}`;
}

function getDataHash(sender, recipient, amount)
{
    const dataObj = {
        sender: sender,
        recipient: recipient, 
        amount: amount,
    };
    const dataJson = JSON.stringify(dataObj);

    return keccak256(utf8ToBytes(dataJson));
}

function sign(recipient, amount, privateKey)
{
    const dataHash   = getDataHash(getAddress(privateKey), recipient, amount);
    const signedData = secp256k1.sign(dataHash, privateKey).addRecoveryBit(0);
    const signedHex  = signedData.toCompactHex();
    
    //console.log("[sign|signedHex]: " + signedHex);

    return signedHex;
}

function verify(signature, sender, recipient, amount)
{
    const dataHash   = getDataHash(sender, recipient, amount);
    const signedData = secp256k1.Signature.fromCompact(signature).addRecoveryBit(0);
    const publicKey  = signedData.recoverPublicKey(dataHash);
    const isSigned   = secp256k1.verify(signedData, dataHash, publicKey.toRawBytes());
    
    //console.log("[verify|isSigned]: " + isSigned);
    
    return isSigned;
}

module.exports = verify;