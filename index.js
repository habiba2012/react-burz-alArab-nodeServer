const express = require('express');
const app = express()
require('dotenv').config()
console.log(process.env.DB_PASS)
const cors = require('cors');
app.use(cors())

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f4ndo.mongodb.net/burzalarab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const admin = require("firebase-admin");

 const serviceAccount = require("./burz-kalifa-firebase-adminsdk-wz8kq-5ece6bc974.json");

 admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});
const port = 5000;

app.get('/',(req,res)=>{
    res.send('Hello world')
})

client.connect(err => {
    const bookings = client.db("burzalarab").collection("booking");
   console.log("connected")

   app.post('/addBooking',(req,res)=>{
       const newBooking = req.body;
       bookings.insertOne(newBooking)
       .then(result=>{
           res.send(result.insertedCount >0)
       })
       console.log(newBooking)
       })
    //get data from mongoDB 
    app.get('/bookings', (req,res) =>{
      const bearer = req.headers.authorization;
      if (bearer && bearer.startsWith('Bearer ')){
        const idToken = bearer.split(' ')[1];
        console.log({idToken})
        admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          console.log(tokenEmail, queryEmail)
          if(tokenEmail == queryEmail){
            bookings.find({email: queryEmail})
            .toArray((err, documents)=>{
              res.status(200).send(documents);
          })
      }
      else{
        res.status(401).send('un-authorized access')
    }
  })
  .catch((error) => {
    res.status(401).send('un-authorized access')
  });

      }
      else{
        res.status(401).send('un-authorized access')
    }
})   
  });

app.listen(process.env.PORT|| port)

