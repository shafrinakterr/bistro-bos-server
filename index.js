const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleWare
app.use(cors())
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://purnoakter11:5DYpbhsadG7DL4VT@cluster0.dkzpzrb.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)


    await client.connect();

    const userCollection = client.db('bistroDb').collection('user');
    const menuCollention = client.db('bistroDb').collection('menu');
    const reviewCollention = client.db('bistroDb').collection('review');
    const cartCollention = client.db('bistroDb').collection('carts');

    // jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      console.log(token);
      res.send({ token });
    })


    // middleWares
    const verifyToken = (req, res, next) => {
      console.log('inside verifyToken', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'forbidden access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          res.status(401).send({message: 'fobidden access'})
        }
        req.decoded =decoded;
        next()
      })
     
    }

    // users related api
    app.get('/user', verifyToken, async (req, res) => {

      const result = await userCollection.find().toArray();
      res.send(result)
    })
    app.post('/user', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        res.send({ message: 'User Already Exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result)
    })

    app.patch('/user/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.delete('/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/menu', async (req, res) => {
      const result = await menuCollention.find().toArray();
      res.send(result)
    })
    app.get('/review', async (req, res) => {
      const result = await reviewCollention.find().toArray();
      res.send(result)
    })


    // cart collection
    app.get('/carts', async (req, res) => {
      const email = req.query?.email
      const query = { email: email }
      const result = await cartCollention.find(query).toArray();
      res.send(result)
    })

    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollention.insertOne(cartItem);
      res.send(result)
    });

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollention.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('runnig is port')
})

app.listen(port, () => {
  console.log(`Bistro boss running on port ${port}`)
})

// purnoakter11
// 5DYpbhsadG7DL4VT