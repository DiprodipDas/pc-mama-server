const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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


        app.get('/categories/:id', async (req, res) => {
            const id = parseInt(req.params.id);
            console.log(id)
            const query = { categoryId: id }
            const cursor = categories.find(query)
            const result = await cursor.toArray();
            console.log(query)
            res.send(result)
            console.log(result)
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