
const express = require("express");
const router_bssr = express.Router();                   // expressni ichidan router olib chiqilyabdi
const restaurantController = require("./controllers/restaurantController");
const productController = require("./controllers/productController");
//const uploader_product = require("./utils/upload-multer");
const {uploadProductImage} = require("./utils/upload-multer");


/**********************************
 *         BSSR  EJS             *
 **********************************/
// ejs uchun,  anaaviy usul


// traditionda front-end da view ishlamaydi o'rniga json formatda ma'lumot boradi


router_bssr
    .get("/signup", restaurantController.getSignupMyRestaurant)  // async function ning callback methodan foydalanyabmiz
    .post("/signup", restaurantController.signupProcess);  // async function ning callback methodan foydalanyabmiz

// biri pageni obberadi biri run qiladi

router_bssr
    .get("/login", restaurantController.getLoginMyRestaurant)
    .post("/login", restaurantController.loginProcess);

router_bssr.get("/logout", restaurantController.logout);
router_bssr.get("/check-me", restaurantController.checkSessions);

router_bssr.get("/products/menu", restaurantController.getMyRestaurantData);
router_bssr.post("/products/create",
    restaurantController.validateAuthRestaurant,
    uploadProductImage.array("product_images", 5),
         productController.addNewProduct
);
router_bssr.post("products/edit/:id", productController.updateChosenProduct);



// export router
module.exports = router_bssr;


