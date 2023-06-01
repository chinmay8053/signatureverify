const express = require("express");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  // public key
  "0339c6bd5b6b187da7cde210bc6ba906e4a3a07908456e16852578e03e65893451": 100,
  "02312db3cb7224bbd2f854e155b8f20b1610f4b261763e8c20124a0ab80b9212a8": 50,
  "038495b8738f41aeb24116508611515f7a8f63faa218a9bd3d5223e0613cd5c9c6": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, hash,signature } = req.body;

  const bool = secp256k1.verify({r:BigInt(signature.r),s:BigInt(signature.s)}, hash, sender);
  console.log("bool: ", bool);
  if (!bool) {
    alert("Invalid Signature");
    return;
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    console.log("sender: ", sender);
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
