const express = require("express");
const router = express.Router();
const db = require("../db");


// add product to database (requires login)
const addProduct = (req, res) => {
    
}


// view all available categories
const showAllCategories = (req, res) => {
    try {
        const showAllCategoriesQuery = "SELECT DISTINCT category FROM products";
        db.query(showAllCategoriesQuery, (err, data) => {
            if(err) return res.status(500).json({"message": "internal server error"});
            if(data.rowCount === 0) return res.status(400).json({"message": "no product category found"});

            let categories = [];
            data.rows.forEach(element => {
                categories.push(element.category);
            });
            res.status(200).json(categories);
        })
    } catch (err) {
        return res.status(500).json({"message": "internal server error"});
    }
}


// view all products
const showallProducts = (req, res) => {
    try {
        const showAllProductsQuery = "SELECT * FROM products";
        db.query(showAllProductsQuery, (err, data) => {
            if(err) return res.status(500).json({"message": "internal server error"});
            if(data.rowCount === 0) return res.status(400).json({"message": "no product found"});

            res.status(200).json(data.rows);
        })
    } catch (err) {
        return res.status(500).json({"message": "internal server error"});
    }
}



// view single product by p_id
const showProductById = (req, res) => {
    try {
        // get id of the product
        const prodId = req.params.id;

        const showProductByIdQuery = "SELECT * FROM products WHERE p_id = $1";
        db.query(showProductByIdQuery, [prodId], (err, data) => {
            if(err) return res.status(500).json({"message": "internal server error"});
            if(data.rowCount === 0) return res.status(400).json({"message": "no product found"});

            res.status(200).json(data.rows[0]);
        })
    } catch (err) {
        return res.status(500).json({"message": "internal server error"});
    }
}



router.post("/addproduct", addProduct);
router.get("/getcategories", showAllCategories);
router.get("/getproducts", showallProducts);
router.get("/getproduct/:id", showProductById);


module.exports = router;