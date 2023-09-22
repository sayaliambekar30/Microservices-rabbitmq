const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    products: {
        type:Array,
        required:true
    },
    user: {
        type:String,
        required:true
    },
    total_price: {
        type:Number,
        required:true
    }   
}, { timestamps: true });

module.exports = Order = mongoose.model("order", OrderSchema);
