// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import mongoConnect from "./database/connectMongo.js";
import discountRuleRouter from "./router/discountRuleRouter.js"
import rulesRouter from "./router/rulesRouter.js"
import { createServer } from "http";
import scriptCreator from "./script-create.js";
import { socketConnection } from "./utils/socket.js";
import ProductRuleModel from "./models/ProductRuleModel.js";
import cartWebHook from "./webhooks/cartWebHook.js";
import ShopModel from "./models/ShopModel.js";
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
mongoConnect()
// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: cartWebHook })
);
app.get("/api/public/route", async (req, res) => {
  try {
    const htmlFile = join(
      `${process.cwd()}/storefront/script`,
      "script.js"
    );
    return res
      .status(200)
      .set("Content-Type", "text/javascript")
      .send(readFileSync(htmlFile));
  } catch (error) {
    console.log("ERROR", error);
  }
});



function applyQrCodePublicEndpoints(app) {
  app.get("/testing", async (req, res) => {
    try {
      console.log('testing');
      res.status(200).send('testing');
    } catch (error) {
      console.log('/testing error', error);
    }
  })

  app.get("/api/getShop", async (req, res) => {
    try {
      const session = res.locals.shopify.session;
      const sendData = await ShopModel.findOne({
        shop: session.shop
      });
      res.status(200).json({
        data: sendData,
        msg: "OKOK"
      });
    } catch (error) {
       res.status(400).json({error:"Something went wrong"})
    }

  })

  app.get("/api/getProductRule", async (req, res) => {
    try {
      // const session = res.locals.shopify.session;
      const sendData = await ProductRuleModel.find({}, {
        product_A_id: 1,
        product_B_id: 1,
        cartValue:1,
        cartQuantity:1,
        endDate:1, 
      });
      res.status(200).json({ data: sendData, msg: "OKOK" });
    } catch (error) {
      res.status(400).json({error:"Something went wrong"})
    }
  });

}


applyQrCodePublicEndpoints(app);


// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.use("/api", discountRuleRouter)
app.use("/api", rulesRouter)

// socket.io implementation 

const httpServer = createServer(app);
await socketConnection(httpServer);


app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.get("/api/script/create", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const getAllScripts = await shopify.api.rest.ScriptTag.all({ session });
    let hostName = `https://${req.headers.host}/api/public/route/?shop=${session.shop}`;

    // https://test-store-2022-22.myshopify.com/admin/api/2022-10/script_tags.json
    // const response = await shopify.api.rest.ScriptTag.delete({ session, id: 224818692415});

    if (getAllScripts.length === 0) {
      const response = await scriptCreator(session, hostName);
      console.log("Script Added!");
      res.status(200).json({ "success": "Script added." })
    } else if (getAllScripts.length > 0) {
      const checkScript = getAllScripts.find(scrpt => scrpt.src.includes("api/public/route"));
      if (checkScript === undefined) {
        const response = await scriptCreator(session, hostName);
        console.log("Script Added!");
        res.status(200).json({ "success": "Script added." })
      }
      // await scriptCreator(session, hostName);
      res.status(200).json({ "success": "Script added." })
    }
  } catch (error) {
    res.status(400).json({ "error": "Something went wrong" })
  }
});



app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

// app.listen(PORT);\
httpServer.listen(PORT);
