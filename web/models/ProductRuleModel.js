import mongoose from "mongoose";

const productruleSchema = new mongoose.Schema({
},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'modified_at'
    },
    strict: false
})

const ProductRuleModel = mongoose.model("ProductRule",productruleSchema);

export default ProductRuleModel;