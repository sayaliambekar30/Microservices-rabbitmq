const express = require("express"); 
const app = express(); 
const PORT = 8090;
const mongoose = require("mongoose");
const Product = require("./product");
const amqp = require("amqplib");
const isAuthenticated = require("../isAuthenticated");
var order;

var channel, connection;

app.use(express.json());

// connect to database
mongoose.connect(
    "mongodb://127.0.0.1:27017/product-service",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(()=>{
       console.log(`Product-Service DB Connected`);
    })
    .catch((err)=>{
        console.error("Error connecting to MongoDB:", err);
    })

    // amqp connect
async function connect() {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("PRODUCT");
}
connect();


// Buy product
app.post("/product/buy", isAuthenticated, async (req, res) => {
    const { ids } = req.body;
    const products = await Product.find({ _id: { $in: ids } });
    channel.sendToQueue(
        "ORDER",
        Buffer.from(
            JSON.stringify({
                products,
                userEmail: req.user.email,
            })
        )
    );
    channel.consume("PRODUCT", (data) => {
        order = JSON.parse(data.content);
    });
    return res.status(200).json({message: "Order placed Successfully", data: order});
});



// Add new product
app.post("/product/create", async (req, res) => {
    try{
    const { name, description, price } = req.body;
   
    const newProduct = new Product({
        name,
        description,
        price,
    });

    newProduct.save();
    return res.status(200).json({message: "Product Added Successfully", data: newProduct});
}
catch{(err)=>{
    return res.status(500).json({message: "Something Went worng ", error : err.message})
}

}
});


// Update product
app.put("/product/update/:productId", async (req, res) => {
    const productId = req.params.productId;
    try {
        const { name, description, price } = req.body;
        
        // Check if the product with the given ID exists
        const updateProduct = await Product.findById(productId);
        if (!updateProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Update the product
        updateProduct.name = name;
        updateProduct.description = description;
        updateProduct.price = price;

        const updatedProduct = await updateProduct.save();

        return res.status(200).json({ message: "Product updated successfully", data: updatedProduct });
    } catch (err) {
        return res.status(500).json({ message: "Something went wrong", error: err.message });
    }
});


// Get all products
app.get("/product/allProduct", async (req, res) => {
    try {
        const products = await Product.find(); 

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        return res.status(200).json(products);
    } catch (err) {
        return res.status(500).json({ message: "Something went wrong", error: err });
    }
});



app.listen(PORT, () => {
    console.log(`Product-Service at ${PORT}`);
});
