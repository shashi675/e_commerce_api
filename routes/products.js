const express = require("express");
const router = express.Router();
const db = require("../db");
const { jwtAuthMiddleWare } = require("../jwt");


// add product to database (requires login)
const addProduct = (req, res) => {
    
}


// view all available categories
const showAllCategories = (req, res) => {
    try {
        const q = "SELECT * FROM categories";
        db.query(q, (err, data) => {
            if(err) return res.status(500).json({error: "internal server error"});
            if(data.rowCount === 0) return res.status(400).json({error: "no product category found"});

            res.status(200).json(data.rows);
        })
    } catch (err) {
        return res.status(500).json({error: "internal server error"});
    }
}


// view all products by category id
const showProductsByCategoryId = (req, res) => {
    try {
        const catId = req.params.catid;
        const q = "SELECT * FROM products  AS p INNER JOIN categories AS c ON p.category_id = c.category_id WHERE c.category_id = $1";
        db.query(q, [catId], (err, data) => {
            if(err) return res.status(500).json({error: "internal server error"});
            if(data.rowCount === 0) return res.status(400).json({error: "no product found"});

            res.status(200).json(data.rows);
        })
    } catch (err) {
        return res.status(500).json({error: "internal server error"});
    }
}



// view single product by p_id
const showProductById = (req, res) => {
    try {
        // get id of the product
        const prodId = req.params.id;

        const q = "SELECT * FROM products  AS p INNER JOIN categories AS c ON p.category_id = c.category_id WHERE p.product_id = $1";
        db.query(q, [prodId], (err, data) => {
            if(err) return res.status(500).json({error: "internal server error"});
            if(data.rowCount === 0) return res.status(400).json({error: "no product found"});

            res.status(200).json(data.rows[0]);
        })
    } catch (err) {
        return res.status(500).json({error: "internal server error"});
    }
}



router.post("/addproduct", addProduct);
router.get("/getcategories", showAllCategories);
router.get("/getproductsbycatid/:catid", showProductsByCategoryId);
router.get("/getproduct/:id", showProductById);


module.exports = router;