const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const productsRoute = require("./routes/products");
const authRoute = require("./routes/auth");
const cartRoute = require("./routes/cart");
const ordersRoute = require("./routes/orders");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");


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


const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'e-commerce-api using Node, Express and PostgreSQL',
            version: '1.0.0'
        },
        servers: [
            {
                url: 'http://localhost:3001/'
            }
        ]
    },
    apis: ['./docs/swagger.yaml', './routes/*.js']
}

const swaggerSpec = swaggerJsDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`server running on port: ${PORT}`);
})