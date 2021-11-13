const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jsdem.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try{
        await client.connect();
        console.log('database connection successfully')
        const database = client.db('car_accessories');
        const carsCollection = database.collection('cars');
        const orderCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const userRatings = database.collection('ratings')

        //Get api
        app.get('/cars', async (req, res) => {
            const cars = await carsCollection.find({}).toArray();
            res.json(cars);
        })
        //get single product
        app.get('/singleCar/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const car = await carsCollection.findOne(query);
            res.json(car);
        })
        //post api single place order
        app.post('/productDetails/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
        // save user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })
         //update api for users from client site
         app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = {email: user.email};
            const options = {upsert: true};
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
        //make admin 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        //check the users admin 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin});
        })

        // MANAGE ALL ORDERS find
        app.get('/manageAllOrders', async(req, res)=>{
            const cursor = orderCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })
        //DELETE API 
     app.delete('/deleteOrder/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await orderCollection.deleteOne(query);
        res.json(result)
        
    })
        //Delete api
     app.delete('/deleteProduct/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await carsCollection.deleteOne(query);
        res.json(result)
        
    })
    //UPDATE single product
    app.put('/updateOrder/:id', async(req, res)=>{
        const id = req.params.id;
        const filter = {_id: ObjectId(id)};
        const options = {upsert: true};
        const updateDoc =  {
            $set: {
               status: "Shipped"
            }
        }
        const result = await orderCollection.updateOne(filter,updateDoc, options)
        res.json(result);

    })
    // POST API INSERT
    app.post('/addSinglePackage', async(req, res)=>{
        const product = req.body;
        const result = await carsCollection.insertOne(product)
        res.send(result)
    })
    //Get api for my orders
    app.get('/myOrders', async (req, res) => {
        const email = req.query.email;
        const query = {email: email};
        const result = await orderCollection.find(query).toArray();
        res.json(result);
    })
    //user ratings api
    app.post('/addRatings', async(req, res)=>{
        const rating = req.body;
        const result = await userRatings.insertOne(rating)
        res.send(result)
    })
    app.get('/reviewRatings', async (req, res) => {
        const result = await userRatings.find({}).toArray();
        res.json(result);
    })
        

    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('Hello cars seller')
})
app.listen(port, ()=>{
    console.log('car server is running', port)
})