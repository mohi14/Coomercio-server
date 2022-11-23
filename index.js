const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3dkasq3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const laptopsCollection = client.db('coomercio').collection('laptops');

        app.get('/laptops', async (req, res) => {
            const query = {};
            const laptops = await laptopsCollection.find(query).toArray();
            res.send(laptops);
        })
    }
    finally {

    }
}

run().catch(error => console.error(error))

app.get('/', (req, res) => {
    res.send('server running')
})

app.listen(port, () => {
    console.log(`Server running on ${port}`)
})