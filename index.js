const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ntptfwh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//jwt-element
function verifyJWT(req, res, next) {
    console.log('token inside verifyJWT', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access')
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {

        if (err) {
            res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}
//jwt-element

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

        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;

            //jwt-element
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            //jwt-element
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
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
        //jwt-element//
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token })
            }
            console.log(user);
            res.status(403).send({ accessToken: '' });
        })
        //jwt-element



        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email=req.params.email;
            const query = { email }
            const user= await usersCollection.findOne(query);
            console.log(user);
            res.send({isAdmin: user?.role ==='admin'});
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = usersCollection.insertOne(user);
            res.send(result);
        })

        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }

            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
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