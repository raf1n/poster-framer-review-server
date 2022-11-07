const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

const serviceCollection = client.db("posterFramer").collection("services");
const reviewCollection = client.db("posterFramer").collection("reviews");

// service post

app.post("/services", async (req, res) => {
  try {
    const service = req.body;
    const result = await serviceCollection.insertOne(service);

    if (result.insertedId) {
      res.send({
        success: true,
        message: `Successfully entered ${service.name}`,
      });
    } else {
      res.send({
        success: false,
        error: "Couldn't Update",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.listen(port, () => console.log(`server running on ${port}`));
