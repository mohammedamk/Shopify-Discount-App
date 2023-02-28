import { io } from "socket.io-client";
const socket = io("https://app1.appparlor.com");
const shopName = location.host
const url = location.href

import './style.css'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});

if (/products/.test(url)) {
    fetch(`${url}.json`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((res) => {
        return res.json()

    }).then((data) => {
        const id = data.product.id;
        socket.emit("findDiscountProduct", { id })

    }).catch((error) => {
        console.log("error", error)
    })

    socket.on("getDiscountProduct", (payload) => {
        const markupText = payload.ruleType === "discount" ? 
        payload.product_B_Discount.discountType_B==="percentage" ? `If you add this product to the cart then you will get another product named <span class="text-primary">${payload.product_B_name}</span>,with a <span class="text-primary"> ${payload.product_B_Discount.discountType_B} </span> discount of <span class="text-primary">${payload.product_B_Discount.discountQuantity_B}</span>.`:`If you add this product to the cart then you would get another product named <span class="text-primary">${payload.product_B_name}</span>  with a discount of <span class="text-primary">${payload.product_B_Discount.discountQuantity_B}</span>.`:
         `If you add this product to the cart then you will get another product named <span class="text-primary">${payload.product_B_name}</span>.`
        const child = document.createElement("div");
        child.innerHTML = `
         <!-- Button trigger modal -->
     <button type="button" class="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#staticBackdrop" id="modalBtn">
       Launch static backdrop modal
     </button>
     
     <!-- Modal -->
     <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
       <div class="modal-dialog">
         <div class="modal-content" style="background-color:#0ce4a7;">
           <div class="modal-body">
           <p class="fw-bold fs-4 text-dark text-wrap">
               ${markupText}
             </p>
           </div>
           <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-bs-dismiss="modal" id="modalClose">Understood</button>
      </div>
         </div>
       </div>
     </div>
         
         `
        document.getElementsByTagName("body")[0].appendChild(child)
        document.getElementById("modalBtn").click()
    })
}


socket.on("addDiscount", (payload) => {
 
    fetch(`https://${shopName}/cart/add.js`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'id': payload.variantIdToAdd,
            'quantity': 1
        })
    }).then(() => {
        window.location.replace(`https://${shopName}/cart`)


    }).catch((error) => {
        console.log("error", error)
    })
})