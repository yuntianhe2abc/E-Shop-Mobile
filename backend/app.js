const express = require("express");
const app = express();
require("dotenv/config");
const morgan = require("morgan");
const mongoose = require("mongoose");
const api = process.env.API_URL;
const productRouter = require("./routers/products.router");
const categoryRouter = require("./routers/categories.router");
const userRouter = require("./routers/users.router");
const orderRouter = require("./routers/orders.router");

const authJwt = require("./helpers/jwt");
const cors = require("cors");
const errorHandler = require("./helpers/errHandler");
//Allow any requests from any other origins
app.use(cors());
app.options("*", cors());
//Middlewares
//make data sent from frontend be understood by express
app.use(express.json()); // Needs parentheses because it's a factory function
app.use(morgan("tiny")); // Needs parentheses because it’s a function that returns a middleware
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

app.use(errorHandler); // No parentheses needed because errorHandler is already a middleware function
//Routers
app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/orders`, orderRouter);

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
