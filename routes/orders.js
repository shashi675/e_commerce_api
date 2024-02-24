const express = require("express");
const router = express.Router();
const db = require("../db");
const { jwtAuthMiddleWare } = require("../jwt");
const { format } = require('date-fns');


const placeOrder = async (req, res) => {
    try {
        const userName = req.userName;
        // select all products from cart
        const q1 = "SELECT * FROM cart_items WHERE user_name = $1";
        const cartItems = await db.query(q1, [userName]);
        // if cart is empty
        if(cartItems.rowCount === 0) return res.status(405).json({error: "Oops! your cart is empty"});

        // check if the item.quantity is not greater than the total quantity of the product
        for(let i=0; i<cartItems.rowCount; i++) {
            const { product_id, quantity } = cartItems.rows[i];
            
            // take out the product quantity details
            const q = "SELECT quantity FROM products WHERE product_id = $1";
            const productDetail = await db.query(q, [product_id]);
            const availableQuantity = productDetail.rows[0].quantity;
            if(quantity > availableQuantity) 
                return res.status(403).json({error: "your cart has more quantity than available quantities", availableQuantity});
        }

        // insert into order_summary table
        const currentTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        const q2 = "INSERT INTO order_summary (user_name, order_timing) VALUES ($1, $2) RETURNING order_id";
        const orderDetail = await db.query(q2, [userName, currentTime]);
        const orderId = orderDetail.rows[0].order_id;
        
        // start a set of queries
        db.query('BEGIN');
        
        // insert each cartItem into order_details table and delete from cart_items table
        cartItems.rows.forEach(async (item) => {
            const { product_id, quantity } = item;

            // update the remaining quantities of the product
            const q = "SELECT quantity FROM products WHERE product_id = $1";
            const productDetail = await db.query(q, [product_id]);
            const availableQuantity = productDetail.rows[0].quantity;
            const q4 = "UPDATE products SET quantity = $1 WHERE product_id = $2";
            await db.query(q4, [availableQuantity - quantity, product_id]);

            // insert query
            const q5 = "INSERT INTO order_details (order_id, product_id, quantity) VALUES ($1, $2, $3)";
            await db.query(q5, [orderId, product_id, quantity]);

            // delete query
            const q6 = "DELETE FROM cart_items WHERE cart_id = $1";
            const cartId = item.cart_id;
            await db.query(q6, [cartId]);
        });
        db.query('COMMIT');
        return res.status(200).json({message: "order placed successfully.", orderId});

    } catch (err) {
        db.query('ROLLBACK');
        res.status(500).json({error: err.message});
    }
}


const viewOrders = async (req, res) => {
    try {
        const userName = req.userName;
        const q = "SELECT p.product_id, title, description, price, os.order_id, os.order_timing, od.quantity FROM order_summary AS os INNER JOIN order_details AS od ON os.order_id = od.order_id INNER JOIN products AS p ON od.product_id = p.product_id WHERE user_name = $1";
        const orderIdsData = await db.query(q, [userName]);
        if(orderIdsData.rowCount === 0) return res.status(200).js({message: "you have not placed any order."});
        return res.status(200).json(orderIdsData.rows);
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
}


const viewOrderById = async (req, res) => {
    try {
        const userName = req.userName;
        const orderId = req.params.orderId;

        // check if this orderId belongs to current user
        const q1 = "SELECT user_name FROM order_summary WHERE order_id = $1";
        const userDetail = await db.query(q1, [orderId]);
        if(userDetail.rowCount === 0) return res.status(403).json({error: "no order with this id exist"});
        if(userName != userDetail.rows[0].user_name) return res.status(403).json({error: "this order does not belong to you"});
        
        // orderId belongs to current user
        const q = "SELECT p.product_id, title, description, price, os.order_id, os.order_timing AS time, od.quantity FROM order_summary AS os INNER JOIN order_details AS od ON os.order_id = od.order_id INNER JOIN products AS p ON od.product_id = p.product_id WHERE os.user_name = $1 AND os.order_id = $2";
        const orderDetail = db.query(q, [userName, orderId]);
        return res.status(200).json((await orderDetail).rows);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}



router.post("/placeOrder", jwtAuthMiddleWare, placeOrder);
router.get("/viewOrders", jwtAuthMiddleWare, viewOrders);
router.get("/viewOrderById/:orderId", jwtAuthMiddleWare, viewOrderById);


module.exports = router;