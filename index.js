const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
app.use(cors())

// console.log(process.env.DB_USE);

const uri = `mongodb+srv://home_services_assignment:brNzopFhOCsRhf8Z@cluster0.ninjyyh.mongodb.net/?retryWrites=true&w=majority`;

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
   const ServicesCollection= client.db("ServicesDb").collection("services")
   const MyCollection= client.db("MyServicesDb").collection("Myservices")

   
 
app.get('/services',async(req,res)=>{
    const body = await ServicesCollection.find().toArray();
    // console.log(body);
    res.send(body);
});

app.get('/services/:id',async(req, res) => {
  const id = req.params.id;
  const query = {
    _id: new ObjectId(id),
  };
  const result = await ServicesCollection.findOne(query)
  console.log(result);
  res.send(result)
    // // console.log(services);  
  })




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

