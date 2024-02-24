const express = require("express");
const router = express.Router();
const db = require("../db");
const { jwtAuthMiddleWare } = require("../jwt");


const addToCart = async (req, res) => {
    try {
        const userName = req.userName;
        const { productId, quantity } = req.body;
        if( !productId || !quantity) return res.status(206).json({message: "required productId and quantity"});

        // check if product already inserted
        const q1 = "SELECT * FROM cart_items WHERE user_name = $1 AND product_id = $2";
        const fetchedData = await db.query(q1, [userName,  productId]);
        if(fetchedData.rowCount > 0) return res.status(405).json({error: "item already inserted. Update the quantity"});


        // check for the product available
        const q2 = "SELECT quantity FROM products WHERE product_id = $1";
        const availableItem = await db.query(q2, [productId]);
        // check if product exist
        if(availableItem.rowCount === 0) return res.status(403).json({error: "no product found"});
        // check for quantity
        if(availableItem.rows[0].quantity < quantity) return res.status(405).json({error: "product available in less quantity", availableQuantity: availableItem.rows[0].quantity});
        

        // insert into cart
        const q3 = "INSERT INTO cart_items (user_name, product_id, quantity) VALUES ($1, $2, $3)";
        const insertItem = await db.query(q3, [userName, productId, quantity]);
        res.status(200).json({message: "item added to cart"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}


const showCart = async (req, res) => {
    try {
        const userName = req.userName;
        
        // select cart items belonging to current user
        const q1 = "SELECT p.product_id, title, description, price, cat.category_id, category_name, c.quantity FROM cart_items AS c INNER JOIN products AS p ON c.product_id = p.product_id INNER JOIN categories AS cat ON p.category_id = cat.category_id WHERE user_name = $1";

        const cartItems = await db.query(q1, [userName]);
        res.status(200).json({cartItems: cartItems.rows});
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
}


const updateCart = (req, res) => {
    try {
        
    } catch (err) {
        return res.status(500).json({error: "internal server error"});
    }
}



const removeCartItemByProductId = async (req, res) => {
    try {
        
    } catch (err) {
        res.status(500).json({error: "internal server error"});
    }
}



router.post("/addToCart", jwtAuthMiddleWare, addToCart);
router.get("/viewCart", jwtAuthMiddleWare, showCart);
router.post("/updateCart", jwtAuthMiddleWare, updateCart);
router.delete("/removeCartPoduct/:productId", jwtAuthMiddleWare,removeCartItemByProductId);


module.exports = router;