import express from 'express'
import mongoose from 'mongoose'
const router = express.Router()
import ProductRuleModel from "../models/ProductRuleModel.js"
import { ObjectId } from 'mongodb'
import ShopModel from "../models/ShopModel.js"
import shopify from "../shopify.js";
import moment from 'moment'

router.post("/getRules",async(req,res)=>{
    const {action,queryValue,endDate}=req.body;
    const shop=res.locals.shopify.session.shop;
    const pattern=new RegExp(queryValue)
    let data;
    let mongoQuery;
    try {
    if(action==="all"){
         mongoQuery={
          shop:shop
         }
    }else if(action==="filter"){
          if(queryValue && !endDate){
              mongoQuery={
                "$or": [
                  { product_A_id: { '$regex': pattern, '$options': 'i' } },
                  { product_A_name: { '$regex': pattern, '$options': 'i' } },
                  { product_B_id: { '$regex': pattern, '$options': 'i' } },
                  { product_B_name: { '$regex': pattern, '$options': 'i' } },
                  {"product_B_Discount.discountQuantity_B": { '$regex': pattern, '$options': 'i' } },
                  {"product_B_Discount.discountType_B": { '$regex': pattern, '$options': 'i' } },
                  {"product_B_Discount.discountCode_B": { '$regex': pattern, '$options': 'i' } },
                  { cartValue: { '$regex': pattern, '$options': 'i' } },
                  { cartQuantity: { '$regex': pattern, '$options': 'i' } },
              ],shop:shop 
              }
          }
          else if(endDate && !queryValue){
              mongoQuery={
                shop:shop,
                endDate:endDate

              }
          }else if(endDate && queryValue ){
            mongoQuery={
              "$or": [
                { product_A_id: { '$regex': pattern, '$options': 'i' } },
                { product_A_name: { '$regex': pattern, '$options': 'i' } },
                { product_B_id: { '$regex': pattern, '$options': 'i' } },
                { product_B_name: { '$regex': pattern, '$options': 'i' } },
                {"product_B_Discount.discountQuantity_B": { '$regex': pattern, '$options': 'i' } },
                {"product_B_Discount.discountType_B": { '$regex': pattern, '$options': 'i' } },
                {"product_B_Discount.discountCode_B": { '$regex': pattern, '$options': 'i' } },
                { cartValue: { '$regex': pattern, '$options': 'i' } },
                { cartQuantity: { '$regex': pattern, '$options': 'i' } },
            ],shop:shop,endDate:endDate
            }
          }else{

          }
    }else{

    }
        data=await ProductRuleModel.find(mongoQuery).sort({_id:-1});
        res.status(200).json({data})
    } catch (error) {
        console.log("error",error)
        res.status(400).json({"error":"Something went wrong"})
    }
})

router.get("/disabledProducts",async(req,res)=>{
  const shop=res.locals.shopify.session.shop;
  try {
      const data= await ProductRuleModel.find({shop:shop},{product_A_name:1})
      res.status(200).json({data:data})
  } catch (error) {
    res.status(400).json({"error":"Something went wrong."})
  }
})




router.post("/updateRuleData",async(req,res)=>{
  const title1=req.body.title
try {
  
    if(req.body.ruleType==="discount"){
    // console.log("updateeeeeeeee",req.body)
    const session1 = res.locals.shopify.session;
    const session = await ShopModel.findOne({
        shop: `${session1.shop}`
    });

    if (session) {
        const client = new shopify.api.clients.Graphql({ session });
        const data1 = await client.query({
            data: `{
                automaticDiscountNodes (first: 250) {
                  edges {
                    node {
                      id
                      automaticDiscount {
                        __typename
                        ... on DiscountAutomaticBxgy {
                          status
                          title
                        }
                        ... on DiscountAutomaticBasic {
                          status
                          title
                        }
                      }
                    }
                  }
                }
              }
              `,
        });
        
        let discountid;
        const discountArray=data1.body.data.automaticDiscountNodes.edges;
            discountArray.forEach((item,index)=> {
              if(item.node.automaticDiscount.title===title1){
                   discountid=item.node.id;
              }
            });

            let products_query = '';

            if (req.body.product_A_id===req.body.old_product_A_id) {
              products_query = `productsToAdd:["gid://shopify/Product/${Number(req.body.product_A_id)}"]`
            } else if (req.body.product_A_id!==req.body.old_product_A_id) {
              products_query = `productsToAdd:["gid://shopify/Product/${Number(req.body.product_A_id)}"],
              productsToRemove:["gid://shopify/Product/${Number(req.body.old_product_A_id)}"]`
            }else{

            }

            let products_query_get="";
            if(req.body.product_B_id===req.body.old_product_B_id){
              products_query_get = `productsToAdd:["gid://shopify/Product/${Number(req.body.product_B_id)}"]`
            }else if(req.body.product_B_id!==req.body.old_product_B_id){
              products_query_get = `productsToAdd:["gid://shopify/Product/${Number(req.body.product_B_id)}"],
              productsToRemove:["gid://shopify/Product/${Number(req.body.old_product_B_id)}"]`
            }else{

            }
            
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
              // console.log("lll",percentageValue_B)
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

            if(discountid){
            const discountUpdatequery = {
              data: `mutation {
                discountAutomaticBxgyUpdate(id:"${discountid}"   
                automaticBxgyDiscount: {
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
                      ${products_query}
                    },
                  }
                },
                customerGets: {
                  value: {
                    ${query}
                  }
                  items: {
                    products: {
                      ${products_query_get}
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
          }

        // console.log('discountUpdatequery', discountUpdatequery)

        const data = await client.query(discountUpdatequery);
        }
        await ProductRuleModel.updateOne({_id:req.body._id},{...req.body})
        res.status(200).json({"success":"Discount Rule Updated Successfully."})
    }
  }else{
    await ProductRuleModel.updateOne({_id:req.body._id},{...req.body},{upsert:true})
    res.status(200).json({"success":"Discount Rule Updated Successfully."})
  }
} catch (error) {
  res.status(400).json({"error":"Something went wrong."})
} 
})


const deleteRule=async (req,res,data)=>{
  
   try {
    const id=data.data.id;
    const title=data.data.title;
      if(data.data.ruleType==="discount"){
        const session1 = res.locals.shopify.session;
            const session = await ShopModel.findOne({
                shop: `${session1.shop}`
            });
          if (session) {
                const client = new shopify.api.clients.Graphql({ session });
                const data1 = await client.query({
                    data: `{
                        automaticDiscountNodes (first: 250) {
                          edges {
                            node {
                              id
                              automaticDiscount {
                                __typename
                                ... on DiscountAutomaticBxgy {
                                  status
                                  title
                                }
                                ... on DiscountAutomaticBasic {
                                  status
                                  title
                                }
                              }
                            }
                          }
                        }
                      }
                      `,
                });
                
                let discountid;
                const discountArray=data1.body.data.automaticDiscountNodes.edges;
                    discountArray.forEach((item,index)=> {
                      if(item.node.automaticDiscount.title===title){
                           discountid=item.node.id;
                      }
                    });
                // console.log("data1",data1.body.data.automaticDiscountNodes.edges[0].node.automaticDiscount.title);
                // console.log("ppp",data1.body.data.automaticDiscountNodes.edges)
  
                if(discountid){
                  // console.log("EEE",id)
                const data = await client.query({
                    data: `mutation {
                        discountAutomaticDelete (id:"${discountid}") {
                          deletedAutomaticDiscountId
                          userErrors {
                            code
                            field
                            message
                          }
                        }
                      }`,
                });
                console.log("deletedata",data.body.data.discountAutomaticDelete.userErrors)
                if(data.body.data.discountAutomaticDelete.userErrors.length===0){
                          await ProductRuleModel.deleteOne({_id:id})
                }
                }
            }
        
        return"success"
      }else{
        await ProductRuleModel.deleteOne({_id:id})
        return "success"
      }
   } catch (error) {
        return "error"
   }
 
    
}


router.post("/deleteRule",async(req,res)=>{
     const response= await deleteRule(req,res,req.body);
     if(response==="success"){
      res.status(200).json({"success":"Rule Deleted Successfully."})
     }else{
      res.status(400).json({"error":"Something went wrong."})
     }
})







router.post("/deleteSelected",async(req,res)=>{
     const idArray=req.body.data;
    //  console.log(idArray);

     for(let i=0;i<idArray.length;i++){
      const a= await ProductRuleModel.findOne({_id:new ObjectId(idArray[i])});
      const response= await deleteRule(req,res,{data:a});
      if(response==="error"){
           res.status(400).json({"error":"Something went wrong."})
           break;
      }else{
          if(i===idArray.length-1){
            res.status(200).json({"success":"Rules Deleted Successfully."})
          }
      }
     }
})
export default router 