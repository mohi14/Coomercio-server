const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3dkasq3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const laptopsCollection = client.db('coomercio').collection('laptops');
        const brandsCollection = client.db('coomercio').collection('brands');
        const usersCollection = client.db('coomercio').collection('users');
        const bookingsCollection = client.db('coomercio').collection('bookings');

        app.get('/laptops', async (req, res) => {
            const query = {};
            const laptops = await laptopsCollection.find(query).toArray();
            res.send(laptops);
        })
        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { category_Id: id };
            const products = await laptopsCollection.find(filter).toArray();
            res.send(products);
        })

        app.get('/brands', async (req, res) => {
            const query = {};
            const brands = await brandsCollection.find(query).toArray();
            res.send(brands);
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const filter = {
                email: user.email,
            }
            const alreadySignup = await usersCollection.find(filter).toArray()
            if (alreadySignup.length) {
                const message = 'User already sign in'
                return res.send({ acknowledged: false, message })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);

        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = {
                email: email
            }
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const query = {
                productName: booking.productName,
                email: booking.email,
            }
            const alreadyBooked = await bookingsCollection.find(query).toArray()

            if (alreadyBooked.length) {
                const message = `You already booked it. Can't book again.`
                return res.send({ acknowledged: false, message })
            }
            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
        })

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
                return res.send({ coomercioToken: token })
            }
            res.status(403).send({ coomercioToken: '' })
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'Seller' })
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'Admin' })
        })

        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.role === 'Buyer' })
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