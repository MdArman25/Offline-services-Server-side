const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()
const app = express();
app.use(express.json())
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://service-sharing-applica/'
    // 'https://cars-doctor-6c129.web.app',
    // 'https://cars-doctor-6c129.firebaseapp.com'
],
credentials: true
}))

app.use(cookieParser());


// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ninjyyh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const logger = (req, res, next) => {
  console.log('log: info', req.method, req.url);
  next();
}


const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
   
  if (!token) {
      return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
      }
      req.user = decoded;
      next();
  })
}





async function run() {
  try {
 const ServicesCollection= client.db("serviceDb").collection("service");
const dbBooking =client.db('serviceDb').collection('booking')


app.post('/jwt',  async (req, res) => {
  const user = req.body;
  console.log('user token');
  console.log('user for token', user);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

  res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      // sameSite: 'none'
  })
      .send({ success: true });
})

app.post('/logout', async (req, res) => {
  const user = req.body;
  console.log('logging out', user);
  res.clearCookie('token', { maxAge: 0 }).send({ success: true })
})


    app.get('/services',async(req,res)=>{
      const filter = req.query;
      console.log(filter);
      const query = {
          // price: { $lt: 150, $gt: 50 
   service_name: {$regex: filter.search, $options:'i'}
      };
      // console.log(query);

      const body = await ServicesCollection.find().toArray();
      // console.log(body);
      res.send(body);
      // console.log(ServicesCollection.find(query));
      });
      
      app.get('/services/:id',async(req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await ServicesCollection.findOne(query)
      // console.log(result);
      res.send(result)
      
      // food request added
      // app.post("/Booking", async (req, res) => {
      //   const Food = req.body;
      //   console.log( 'food ' ,Food);
      //   const result = await dbBooking.insertOne(Food);
      //   console.log(result);
      //   res.send(result);
      // });
      
        // // console.log(services);  
      })

//  app.get('/bookings', logger, verifyToken, async (req, res) => {
//             console.log(req.query.email);
//             console.log('token owner info', req.user)
//             if (req.user.email !== req.query.email) {
//                 return res.status(403).send({ message: 'forbidden access' })
//             }
//             let query = {};
//             if (req.query?.email) {
//                 query = { email: req.query.email }
//             }
//             const result = await bookingCollection.find(query).toArray();
//             res.send(result);
//         })

 app.get('/AddServices',  async (req, res) => {
            console.log(req.query.email);
            console.log('token owner info', req.user)
            if (req.user.email !== req.query.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await ServicesCollection.find(query).toArray();
            res.send(result);
        })

    app.get('/myService', verifyToken,async(req,res)=>{
      console.log('quary email', req.query.email);
      console.log('token owner info', req.user)
      if (req.user.email !== req.query.email) {
          return res.status(403).send({ message: 'forbidden access' })
      }
      let query = {};
      if (req.query?.email) {
          query = { email: req.query.email }
      }
      const result = await ServicesCollection.find(query).toArray();
      res.send(result);

        // const body = await dbBooking.find().toArray();
        // res.send(body);
      });


      app.post('/services',async(req,res)=>{
        const body =req.body;
        console.log(body);
        const result= await ServicesCollection.insertOne(body);
        console.log(result);
        res.send(result)
      })
      app.post('/AddBooking',async(req,res)=>{
        const body =req.body;
        console.log(body);
        const result= await dbBooking.insertOne(body);
        console.log(result);
        res.send(result)
      })

    
    // Connect  the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('OFFLINE SERVICE SERVER IS rUNNING')
})
app.listen(port,()=>{
    console.log(`Service server is running on ${port}`);
})
// 

