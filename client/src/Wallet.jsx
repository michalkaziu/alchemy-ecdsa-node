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
/////



function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) 
{
  async function onChange(evt) 
  {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);

    const address = getAddress(privateKey);
    setAddress(address);

    if (address) 
    {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    }
    else 
    {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private key
        <input placeholder="Type a private key" value={privateKey} onChange={onChange}></input>
      </label>


      <div className="balance">Address: {address}</div>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
