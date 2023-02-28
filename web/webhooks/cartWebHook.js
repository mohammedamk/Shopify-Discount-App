import { DeliveryMethod } from "@shopify/shopify-api";
import ProductRuleModel from "../models/ProductRuleModel.js";
// import { io } from "../index.js";
import { addDiscount } from "../utils/socket.js";

export default {
  CARTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // console.log("niger",payload)
      let cartProductDetails = { cartItems: [], original_total_price: 0, cartItem_Count: payload?.line_items.length,total_discount:0}
      cartProductDetails.cartItems=payload.line_items,
      payload?.line_items?.forEach(item => {
          cartProductDetails.original_total_price=cartProductDetails.original_total_price + Number(item.original_line_price);
          cartProductDetails.total_discount=cartProductDetails.total_discount + Number(item.total_discount)
        });
        
        if(cartProductDetails.cartItems.length!==0 && cartProductDetails.total_discount===0){
          const rules=[];
          let variantIdToAdd=""
          const getData=async()=>{
           for(let item of cartProductDetails.cartItems){
            const rule= await ProductRuleModel.findOne({variant_A_id:item.variant_id.toString(),shop:shop},{
              variant_A_id:1,
              variant_B_id:1,
              product_A_id: 1,
              product_B_id: 1,
              cartValue:1,
              cartQuantity:1,
              endDate:1, })
             rule && rules.push(rule);
           }
          }
        await getData();
        
        if(rules.length>1){
           variantIdToAdd=null;
        }else if(rules.length===1){
          const dateValid=rules[0].endDate?new Date(rules[0].endDate)>=new Date():true;
            if(Number(rules[0].cartValue)*100<=cartProductDetails.original_total_price &&
              rules[0].cartQuantity<=cartProductDetails.cartItem_Count && dateValid){
                    variantIdToAdd=rules[0].variant_B_id
              }
        }else{

        }
       variantIdToAdd && addDiscount(variantIdToAdd);
        }
      }

    }
}
