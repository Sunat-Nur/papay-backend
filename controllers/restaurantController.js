/* object yasalib uni modulening ichidagi exportga tenglashtirilyabdi
 object da methodlari orqali chaqirilyabdi
 controllerlar object orqali quriladi, model class lar orqali quramiz
 */


const Product = require("../models/Product");
const Member = require("../models/member");
const Definer = require("../lib/mistake");
const assert = require("assert");

let restaurantController = module.exports;

restaurantController.home = (req,res) => {
    try {
        console.log("GET: cont/home");
        res.render('home-page');  // home-page.ejs fielga malumotni yuborayopti.
    } catch(err) {
        console.log(`ERROR: cont/home, ${err.message}`);  //error bulsa qaytar degan qism.
        res.json({state: "fail", message: err.message});
    }
};

restaurantController.getMyRestaurantProducts = async (req, res) => {
    try {
        console.log("GET: cont/getMyRestaurantProducts");
        const  product = new Product();       // product class dan product objectini hosil qilyabmiz
        const data = await product.getAllProductsDataResto(res.locals.member);
        //restorani product listini oberadi
        // getallProductdataResto methodini hosil qilyabmiz
        // bu yerda to'g'ridan to'g'ri localdan  datani qabul qilyabdi

        res.render("restaurant-menu", {restaurant_data: data} ); // restarant menuga tegishli data borsin
    } catch(err) {
        console.log(`ERROR: cont/getMyRestaurantData, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
}

restaurantController.getSignupMyRestaurant = async (req, res) => {
   try {
       console.log("GET: cont/getSignupMyRestaurant");
       res.render("signup");
   } catch(err) {
       console.log(`ERROR: cont/getSignupMyRestaurant, ${err.message}`);
       res.json({state: "fail", message: err.message});
   }
}



restaurantController.signupProcess = async (req, res) => {
    try {
        console.log("POST: cont/signupProcess");
        assert(req.file, Definer.general_err3);

        let new_member = req.body;
        new_member.mb_type = "RESTAURANT";
        new_member.mb_image = req.file.path;

        const member = new Member(); // member servica modeldan instance olyabdi
        const result = await member.signupData(new_member); // mongo db ga qo'shib berdi
        assert(req.file, Definer.general_err1);

        req.session.member = result;
        res.redirect('/resto/products/menu');
    } catch (err) {
        console.log(`ERROR, cont/signupProcess, ${err.message}`);
        res.json({ state: 'fail', message: err.message });
    }
};


restaurantController.getLoginMyRestaurant = async (req, res ) => {
    try {
        console.log("GET: cont/getLoginMyRestaurant");
       res.render('login-page')
    } catch(err){
        console.log(`ERROR, cont/getLoginMyRestaurant, ${err.message}`)
        res.json({state: "fail", message: err.message});
    }
};
restaurantController.loginProcess = async (req, res ) => {
    try {
        console.log("POST: cont/loginProcess");
        const data = req.body,
            member = new Member();        //ichida request body yuborilyabdi
        result = await member.loginData(data);  //memberimizni butun ma'lumotlari resultda mavjud

        req.session.member = result;       // session ni ichidan member objectni hosil qilib, qiymatlarni  result ni ichida yuklaymiz
        req.session.save(function () {     //login bolgandan ken qaysi page ga borishi mumkinligini korsatyabmiz
            result.mb_type === "ADMIN"
           ? res.redirect("/resto/all-restaurant")
           : res.redirect("/resto/products/menu");
        });
    }
    catch(err){
        console.log(`ERROR, cont/login, ${err.message}`)
        res.json({state: "fail", message: err.message});
    }
};


restaurantController.logout = (req, res ) => {
    console.log("GET cont.logout");
    res.send("logout page");
};

restaurantController.validateAuthRestaurant = (req, res, next) => {
    if(req.session?.member?.mb_type === "RESTAURANT") {
        req.member = req.session.member;
        next();
    } else res.json({state: "fail", message: "only authenticated members with restaurant type" })
};


restaurantController.checkSessions = (req, res ) => {
    if(req.session?.member) {
        res.json({state: 'succeed', data: req.session.member });
    } else {
        res. json ({state: "fail", message: "You aren't authenticated"});
    }
};
// agar session mavjud bolsa sessiondagi ma'lumotlarni brouserga yuborsin