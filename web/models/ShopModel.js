import mongoose from "mongoose";

const shopSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    id: String,
    shop: String,
    state: String,
    isOnline: Boolean,
    scope: String,
    accessToken: String
})

const ShopModel = mongoose.model("shopify_sessions", shopSchema);

export default ShopModel;




