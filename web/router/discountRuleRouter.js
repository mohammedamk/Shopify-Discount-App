import express from 'express'
import mongoose from 'mongoose'
const router = express.Router()
import ProductRuleModel from "../models/ProductRuleModel.js"

import ShopModel from "../models/ShopModel.js"
import { Shopify, LATEST_API_VERSION } from "@shopify/shopify-api"
import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify.js";
import moment from 'moment'


router.post("/saveRuleData", async (req, res) => {
  const session1 = res.locals.shopify.session;
  try {
    const data= await ProductRuleModel.find({shop:session1.shop},{product_A_id:1});
    for(let i=0;i<data.length;i++){
      if(data[i].product_A_id===req.body.product_A_id){
        // console.log("enterr")
        return res.status(400).json({"error":"Rule for this product is already present,please use another product to create the new rule or edit the existing rule."});
      }
    }
  
      if (req.body.ruleType === "discount") {
        // console.log("uuuRR",req.body)
        const session1 = res.locals.shopify.session;
        const session = await ShopModel.findOne({
          shop: `${session1.shop}`
        });
        
        
        let query;
        if (req.body.product_B_Discount.discountType_B === "percentage") {
          let percentageValue = Number(req.body.product_B_Discount.discountQuantity_B) / 100;
          if (percentageValue === 0) {
            percentageValue = 0.00
          } else if (percentageValue === 1) {
            percentageValue = 1.00
          } else {

          }
          query = `discountOnQuantity: {
                quantity: "1",
                effect: {
                  percentage:${percentageValue}
                }
              }`
        } else if (req.body.product_B_Discount.discountType_B === "fixed") {
          let percentageValue_B = (Number(req.body.product_B_Discount.discountQuantity_B) / Number(req.body.price_B))

          if (percentageValue_B === 0) {
            percentageValue_B = 0.00
          } else if (percentageValue_B === 1) {
            percentageValue_B = 1.00
          } else {

          }

          query = `discountOnQuantity: {
          quantity: "1",
          effect: {
           percentage:${percentageValue_B}
          }
        }`
          // console.log(query)
        } else {

        }
        if (session) {
          const client = new shopify.api.clients.Graphql({ session });
          const data = await client.query({
            data: `mutation {
                    discountAutomaticBxgyCreate(automaticBxgyDiscount: {
                      title:"${req.body.product_B_Discount.discountCode_B}",
                      startsAt: "${moment().format('YYYY-MM-DD')}",
                      ${req.body.endDate && `endsAt:"${req.body.endDate}"`},
                      usesPerOrderLimit: "1",
                      customerBuys: {
                        value: {
                          quantity: "1"
                        }
                        items: {
                          products: {
                            productsToAdd: ["gid://shopify/Product/${Number(req.body.product_A_id)}"]
                          }
                        }
                      },
                      customerGets: {
                        value: {
                          ${query}
                        }
                        items: {
                          products: {
                            productsToAdd: ["gid://shopify/Product/${Number(req.body.product_B_id)}"]
                          }
                        }
                      }}) {
                      userErrors {
                        field
                        message
                        code
                      }
                      automaticDiscountNode {
                          automaticDiscount {
                          ... on DiscountAutomaticBxgy {
                            title
                            summary
                            status
                          }
                        }
                      }
                    }
                  }
                  `,
          });

          // console.log("Ruledata",data.body.data.discountAutomaticBxgyCreate)
          // // console.log("Ruledata3333",data.body.extensions.cost)
          // console.log("datat",data.body.data.discountAutomaticBxgyCreate.useErrors[0].field)
          const title = data.body.data.discountAutomaticBxgyCreate.automaticDiscountNode.automaticDiscount.title
          await ProductRuleModel({ ...req.body, title, shop: session1.shop }).save()

        }
      } else {
        
        await ProductRuleModel({
          product_A_id:req.body.product_A_id,
          product_A_name:req.body.product_A_name,
          price_A:req.body.price_A,
          product_B_id:req.body.product_B_id,
          product_B_name:req.body.product_B_name,
          price_B:req.body.price_B,
          product_B_Discount:{
            discountCode_B:"",
            discountQuantity_B:"",
            discountType_B:""
          },
          variant_A_id:req.body.variant_A_id,
          variant_B_id:req.body.variant_B_id,
          endDate:req.body.endDate,
          ruleType:req.body.ruleType,
          cartValue:req.body.cartValue,
          cartQuantity:req.body.cartQuantity,
          shop: session1.shop
        }).save()
      
    }
    return res.status(200).json({ "success": "Data saved successfully." })
  } catch (error) {
    console.log("ERROR", error.response)
    return res.status(400).json({ "error": "Something went wrong" })
  }
})


export default router 