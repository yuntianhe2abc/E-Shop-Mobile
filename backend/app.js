const express = require("express");
const app = express();
require("dotenv/config");
const morgan = require("morgan");
const mongoose = require("mongoose");
const api = process.env.API_URL;
const productRouter = require("./routers/products.router");
const categoryRouter = require("./routers/categories.router");
const userRouter = require("./routers/users.router");
const authJwt = require("./helpers/jwt");
const cors = require("cors");

//Allow any requests from any other origins
app.use(cors());
app.options("*", cors());
//Middlewares
//make data sent from frontend be understood by express
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
//Routers
app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/users`, userRouter);

//Database
mongoose
  .connect(process.env.DATABASE_CONNECTION_STRING, { useNewUrlParser: true })
  .then(() => {
    console.log("Database Connection is ready... ");
  })
  .catch((err) => {
    console.log(err);
  });

//Server
app.listen(3004, () => {
  console.log(api);
  console.log("server is running http://localhost:3000 ");
});
