import { Server } from "socket.io";
import ProductRuleModel from "../models/ProductRuleModel.js";
import ShopModel from "../models/ShopModel.js";
let connectedSocket

export async function socketConnection(httpServer) {

  const shopsData = await ShopModel.find({});
  const originArray=[];
  shopsData.forEach((item)=>{
    originArray.push(`https://${item.shop}`)
  })
  // console.log(originArray,"ppp")
  const io = new Server(httpServer, {
    cors: {
      origin: originArray,
    }
  });

  io.on("connection", (socket) => {
    console.log("socket connection successful.");
    connectedSocket = socket;

    connectedSocket?.on("findDiscountProduct", async (payload) => {
      // console.log("payload", payload)
      const rule = await ProductRuleModel.findOne({ product_A_id: payload.id.toString() }, {
        product_B_name: 1,
        ruleType: 1,
        product_B_Discount: 1
      })
      rule && connectedSocket?.emit("getDiscountProduct", rule);
    })
  });

  io.on("disconnect", (socket) => {
    console.log("socket disconnected successfully.");
  });
}


export async function addDiscount(variantIdToAdd) {
  // console.log('addDiscount variantIdToAdd', variantIdToAdd)
  connectedSocket?.emit('addDiscount', { variantIdToAdd })
}


