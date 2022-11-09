const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const jwt = require("jsonwebtoken");

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

//  jwt function

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.SECRET_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function posterFramerDbConnect() {
  try {
    await client.connect();
    console.log("Database connected");
  } catch (error) {
    console.log(error.name, error.message);
  }
}
posterFramerDbConnect();

// jwt endpoint
app.post("/jwt", (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.SECRET_TOKEN, {
    expiresIn: "1d",
  });
  res.send({ token });
});

const serviceCollection = client.db("posterFramer").collection("services");
const reviewCollection = client.db("posterFramer").collection("reviews");

// service post

app.post("/service/add-service", async (req, res) => {
  try {
    const service = req.body;
    const date = new Date();
    serviceWithDate = { ...service, date };
    const result = await serviceCollection.insertOne(serviceWithDate);

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
    const cursorWithLimit = serviceCollection
      .find(query)
      .sort({ date: -1 })
      .limit(3);
    const servicesWithLimit = await cursorWithLimit.toArray();
    const cursor = serviceCollection.find(query).sort({ date: -1 });
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

// add review

app.post("/add-review", verifyJWT, async (req, res) => {
  try {
    const review = req.body;
    const date = new Date();
    reviewWithDate = { ...review, date };
    const result = await reviewCollection.insertOne(reviewWithDate);

    if (result.insertedId) {
      res.send({
        success: true,
        message: `Successfully Added your review`,
      });
    } else {
      res.send({
        success: false,
        error: "Couldn't Post your Review",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// get individual review

app.get("/reviews/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  try {
    const review = await reviewCollection.findOne({ _id: ObjectId(id) });
    res.send({
      success: "true",
      message: "Successfully got the data",
      data: review,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// review according to service
app.get("/review", async (req, res) => {
  try {
    const query = {
      s_id: req.query.s_id,
    };
    const cursor = reviewCollection.find(query).sort({ date: -1 });
    const reviewQ = await cursor.toArray();
    res.send({
      success: true,
      data: reviewQ,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
//  get own review
app.get("/myreview", verifyJWT, async (req, res) => {
  try {
    let query = {};
    if (req.query.email) {
      query = {
        r_email: req.query.email,
      };
    }
    const cursor = reviewCollection.find(query).sort({ date: -1 });
    const review = await cursor.toArray();
    res.send({
      success: true,
      data: review,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// delete particular review

app.delete("/review/:id", verifyJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await reviewCollection.deleteOne({ _id: ObjectId(id) });

    if (result.deletedCount) {
      res.send({
        success: true,
        message: "Successfully Deleted",
      });
    } else {
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// edit and update review

app.patch("/edit-review/:id", verifyJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await reviewCollection.updateOne(
      { _id: ObjectId(id) },
      {
        $set: {
          review: req.body.review,
        },
      }
    );
    if (result.matchedCount) {
      res.send({
        success: true,
        message: `successfully updated`,
      });
    } else {
      res.send({
        success: false,
        error: "Couldn't update",
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
