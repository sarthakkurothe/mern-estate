const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); 
const userRouter = require('./routes/user.route.js'); 
dotenv.config();

const app = express();

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log('Server is running on port 3000!');
});

app.use("/api/user", userRouter);
