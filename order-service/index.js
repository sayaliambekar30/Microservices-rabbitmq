const express = require("express");
const app = express();
const PORT = 9090;
const mongoose = require("mongoose");
const Order = require("./order");
const amqp = require("amqplib");
const isAuthenticated = require("../isAuthenticated");

var channel, connection;

// // connect to database
mongoose.connect(
    "mongodb://127.0.0.1:27017/order-service",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
    console.log(`Order-Service DB Connected`);
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use(express.json());

// Create order
function createOrder(products, userEmail, userId) {
    try {
        let total = 0;
        for (let t = 0; t < products.length; ++t) {
            total += products[t].price;
        }

        const newOrder = new Order({
            products,
            user: userEmail,
            userId: userId,
            total_price: total,
        });

        newOrder.save();

        return newOrder;
    } catch (err) {
        console.error("Error creating order:", err); 
    }
}



async function connect() {
    try {
        const amqpServer = "amqp://localhost:5672";
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        await channel.assertQueue("ORDER");
    } catch (err) {
        console.error("Error connecting to RabbitMQ:", err);
    }
}

connect().then(() => {
    channel.consume("ORDER", (data) => {
        try {
            console.log("Consuming ORDER service");
            const { products, userEmail, userId } = JSON.parse(data.content);
            const newOrder = createOrder(products, userEmail, userId);
            channel.ack(data);
            channel.sendToQueue(
                "PRODUCT",
                Buffer.from(JSON.stringify({ newOrder }))
            );
        } catch (err) {
            console.error("Error processing ORDER message:", err);
            
        }
    });
});


// get all orders of user using email
app.get("/order/user/:userEmail",isAuthenticated, async (req, res) => {
    const userEmail = req.params.userEmail;
    try {
        const userOrders = await Order.find({user:userEmail});
       if (userOrders.length === 0) {
            return res.status(404).json({ message: "No orders found" });
        }

        return res.status(200).json(userOrders);
    } catch (err) {
        return res.status(500).json({ message: "Something went wrong" , error: err.message });
    }
});

// Delete order by id
app.delete("/order/:orderId", isAuthenticated, async (req, res) => {
    const orderId = req.params.orderId;
    try {
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        return res.status(200).json({ message: "Order deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Something went wrong" , error: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`Order-Service at ${PORT}`);
});
