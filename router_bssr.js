
const express = require("express");
const router_bssr = express.Router();                   // expressni ichidan router olib chiqilyabdi
const restaurantController = require("./controllers/restaurantController");
const productController = require("./controllers/productController");
const upload_product = require("./utils/upload-multer")("products");
const uploader_members = require("./utils/upload-multer")("members")

/**********************************
 *         BSSR  EJS             *
 **********************************/
// ejs uchun,  anaaviy usul


// traditionda front-end da view ishlamaydi o'rniga json formatda ma'lumot boradi

router_bssr.get("/",restaurantController.home);


router_bssr
    .get("/sign-up", restaurantController.getSignupMyRestaurant)  // get ejs ni yuklash uchun.  async function ning callback methodan foydalanyabmiz
    .post(
        "/sign-up",
        uploader_members.single("restaurant_img")
        ,restaurantController.signupProcess);  // async function ning callback methodan foydalanyabmiz

// biri pageni obberadi biri run qiladi

router_bssr
    .get("/login", restaurantController.getLoginMyRestaurant)
    .post("/login", restaurantController.loginProcess);

  /// GET, POST lar bular API end point hisoblanadi

router_bssr.get("/logout", restaurantController.logout);
router_bssr.get("/check-me", restaurantController.checkSessions);

router_bssr.get("/products/menu", restaurantController.getMyRestaurantProducts);
router_bssr.post("/products/create",
    restaurantController.validateAuthRestaurant,
    upload_product.array("product_images", 5),
         productController.addNewProduct
);
router_bssr.post("/products/edit/:id",
    restaurantController.validateAuthRestaurant,
    productController.updateChosenProduct);



// export router
module.exports = router_bssr;


