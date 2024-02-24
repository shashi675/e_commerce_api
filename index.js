const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const productsRoute = require("./routes/products");
const authRoute = require("./routes/auth");
const cartRoute = require("./routes/cart");
const ordersRoute = require("./routes/orders");


app.use(express.json());
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// different routes for APIs
app.use("/api/products", productsRoute);
app.use("/api/auth", authRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", ordersRoute);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`server running on port: ${PORT}`);
})