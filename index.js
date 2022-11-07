const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.port || 5000;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gghczmk.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function posterFramerDbConnect() {
  try {
    await client.connect();
    console.log("Database connected");
  } catch (error) {
    console.log(error.name, error.message);
  }
}
posterFramerDbConnect();

app.listen(port, () => console.log(`server running on ${port}`));
