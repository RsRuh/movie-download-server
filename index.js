const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v8gjvac.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const movieCollection = client.db('tSeries').collection('movies')
        const downloadCollection = client.db('tSeries').collection('downloads')
        const usersCollection = client.db('tSeries').collection('users')

        app.get('/movies', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            
            console.log(page, size);
            const query = {};
            const cursor = movieCollection.find(query);
            const result = await cursor.skip(page*size).limit(size).toArray();
            const count = await movieCollection.estimatedDocumentCount();
            res.send({count, result});
        })

        // app.get('/movies', async (req, res) => {
        //     const query = {};
        //     const cursor = movieCollection.find(query)
        //     const result = await cursor.toArray();
        //     const count = await movieCollection.estimatedDocumentCount();
        //     res.send({result, count});
        // })

        
        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = usersCollection.find(query)
            const result = await cursor.toArray();
            const count = await usersCollection.estimatedDocumentCount();
            res.send({result, count});
        })

        // app.get('/download', async (req, res) => {
    
        //     let query = {};
        //     if (req.query.email) {
        //         query = {
        //             email: req.query.email
        //         }
        //     }
        //     const cursor = downloadCollection.find(query)
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })

        app.get('/download', async (req, res) => {
           
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = downloadCollection.find(query)
            const result = await cursor.skip(page*size).limit(size).toArray();
            const count = await downloadCollection.estimatedDocumentCount();
            res.send({count,result});
        })

        app.post('/upload', async (req, res) => {
            const upload = req.body;
            const result = await movieCollection.insertOne(upload);
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const upload = req.body;
            const result = await usersCollection.insertOne(upload);
            res.send(result)
        })

        app.post('/download', async (req, res) => {
            const download = req.body;
            const result = await downloadCollection.insertOne(download);
            res.send(result)
        })

        app.delete('/download/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await downloadCollection.deleteOne(query)
            res.send(result);
        })
        
        app.delete('/users/:id', async(req, res)=>{
            const id = req.params.id;
            console.log(id);
            const query = {_id: ObjectId(id)};
            const result = await usersCollection.deleteOne(query)
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(er => console.error(er))


app.get('/', (req, res) => {
    res.send('Movie Downloader server is running');
})

app.listen(port, () => {
    console.log(`Running on port port`);
})