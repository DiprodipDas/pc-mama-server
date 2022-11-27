const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ntptfwh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categories = client.db('pcMama').collection('categories');
        const bookingsCollection = client.db('pcMama').collection('bookings');
        const usersCollection = client.db('pcMama').collection('users');


        app.get('/categories/:id', async (req, res) => {
            const id = parseInt(req.params.id);
            console.log(id)
            const query = { categoryId: id }
            const cursor = categories.find(query)
            const result = await cursor.toArray();
            console.log(query)
            res.send(result)
            console.log(result)
        });

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings=await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking)

            const query = {
                customerName: booking._id,
                email: booking.email,
                product: booking.product
            }
            // const alreadyBooked=await bookingsCollection.find(query).toArray();
            // if(alreadyBooked.length){
            //     const message=`you already have an order in this product!Try another one.`
            //     res.send({acknowledged:false,message})
            // }
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })

        app.post('/users',async(req,res)=>{
            const user=req.body;
            const result=usersCollection.insertOne(user);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(console.log);



app.get('/', (req, res) => {
    res.send('pc mama server running successfully')
});


app.listen(port, () => {
    console.log(`pcMAMA is running on port ${port}`)
})