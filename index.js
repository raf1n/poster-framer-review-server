const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running");
});

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

app.post("/service/add-service", async (req, res) => {
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

// service get
app.get("/services", async (req, res) => {
  try {
    const query = {};
    const cursorWithLimit = serviceCollection.find(query).limit(3);
    const servicesWithLimit = await cursorWithLimit.toArray();
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send({
      success: true,
      message: "Successfully got data",
      data: { servicesWithLimit, services },
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// individual service get

app.get("/service/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const service = await serviceCollection.findOne({ _id: ObjectId(id) });
    res.send({
      success: "true",
      message: "Successfully got the data",
      data: service,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// query with value

app.get("/service", async (req, res) => {
  try {
    const query = {
      name: req.query.name,
    };
    const cursor = serviceCollection.find(query);
    const serviceQ = await cursor.toArray();
    res.send({
      success: true,
      data: serviceQ,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.listen(port, () => console.log(`server running on ${port}`));
