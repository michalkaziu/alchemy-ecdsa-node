import { useState } from "react";
import server from "./server";

/////
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { bytesToHex, utf8ToBytes } from "ethereum-cryptography/utils";

function getAddress(privateKey)
{
    if (privateKey.length != 64)
        return "";

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
//////////

function Transfer({ address, setBalance, privateKey })
{
  const [sendAmount, setSendAmount] = useState(0);
  const [recipient, setRecipient]   = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) 
  {
    evt.preventDefault();

    try 
    {
      const amount    = parseInt(sendAmount);
      const signature = sign(recipient, amount, privateKey);
      
      const sender = getAddress(privateKey);
      verify(signature, sender, recipient, amount);
      
      const { data: { balance },} = await server.post(`send`, 
      {
        signature: signature,
        sender: address,
        recipient: recipient,
        amount: amount,
      });
      setBalance(balance);
    } 
    catch (ex) 
    {
      if (ex.response)
      {
        alert(ex.response);

        if (ex.response.data)
          alert(ex.response.data.message);
      }
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
      
    </form>
  );
}

export default Transfer;
