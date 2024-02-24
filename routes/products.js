const express = require("express");
const router = express.Router();
const db = require("../db");
const { jwtAuthMiddleWare } = require("../jwt");


// add product to database (requires login)
const addProduct = async (req, res) => {
    try {
        const { title, description, price, category, quantity } = req.body;

        // check for title, price, category
        if(!title || !price || !category || !quantity) return res.status(401).json({error: "required title, price, category and quantity"});

        // check if the product has already been inserted
        const q = "SELECT product_id FROM products WHERE title = $1";
        const isProductInserted = await db.query(q, [title]);
        if(isProductInserted.rowCount > 0) {
            return res.status(401).json({error: "product with this title has already been inserted."});
        }

        // start a set of transactions using BEGIN, COMMIT AND ROLLBACK
        db.query('BEGIN');

        // check for the category if it exists
        const q1 = "SELECT category_id from categories WHERE categories.category_name = $1";
        const fetchedCategoryId = await db.query(q1, [category]);
        let categoryId;

        if(fetchedCategoryId.rowCount > 0) {
            categoryId = fetchedCategoryId.rows[0].category_id;
        }
        else {
            // insert new category name
            const q2 = "INSERT INTO categories (category_name) VALUES ($1) RETURNING category_id";
            const insertedCategoryId = await db.query(q2, [category]);
            categoryId = insertedCategoryId.rows[0].category_id;
        }

        // insert data into products table
        const q3 = "INSERT INTO products (title, description, price, category_id, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING product_id";
        const insertedProduct = await db.query(q3, [title, description, price, categoryId, quantity]);

        db.query('COMMIT');

        res.status(200).json({message: "product saved", productId: insertedProduct.rows[0].product_id, categoryId: categoryId});
    } catch (err) {
        db.query('ROLLBACK');
        res.status(500).json({error: err.message});
    }
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



router.post("/addproduct", jwtAuthMiddleWare, addProduct);
router.get("/getcategories", showAllCategories);
router.get("/getproductsbycatid/:catid", showProductsByCategoryId);
router.get("/getproduct/:id", showProductById);


module.exports = router;