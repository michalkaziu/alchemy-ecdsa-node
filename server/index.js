const express = require("express");
const verify = require("./scripts/generate");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x4e06365da60614597c48adcfa3d823bf345c23294404daf524c719455b4d7d54": 100, //916143b543d321673c00cee8443ddeadf658aa30217c1e2b19da81cec6052b1c
  "0x5e5a7b37ecc5bd7b8d78133c14f657b760f3d5fac36b8cddf3ccfd5af9361130": 50,  //a1d47bd345ddff8b5bf25287df3fff2834f8271679fede3e613cbd9c49088a2e
  "0x66dbae2fa42e7ec0f702037a2c36e92efb00127eeddd13b2c9b9369358a94ce4": 75,  //567139db1041c1134642293c7bebb2eb7538b966d6325d8b14b16d65e8e6875c
};

app.get("/balance/:address", (req, res) => 
{
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => 
{
  const { signature, sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (verify(signature, sender, recipient, amount) === false)
  {
    res.status(403).send({ message: "Invalid signature!" });
  }
  else if (balances[sender] < amount) 
  {
    res.status(400).send({ message: "Not enough funds!" });
  } 
  else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
