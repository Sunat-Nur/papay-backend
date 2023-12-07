const OrderModel = require("../schema/order.model");
const OrderItemModel = require("../schema/order_item.model")
const mongoose = require("mongoose");
const {shapeIntoMongooseObjectId} = require("../lib/config");
const Definer = require("../lib/mistake");
const assert = require("assert");


class Order {
    constructor() {
        this.orderModel = OrderModel;
        this.OrderItemModel = OrderItemModel;
    }

    // database va schema_model bn ishlayotgani uchun async ko'rishida createOrderDate method yaratib oldim
    async createOrderDate(member, data) {    // viewChosenItemByMember methodiga 2 ta parametrini  member va data ni path qilyabman
        try {   // ikkit o'zgaruvchan qiymatga ega bolgan object yaratib oldim

            console.log("createOrderDate is working");
            let order_total_amount = 0, delivery_cost = 0;
            const mb_id = shapeIntoMongooseObjectId(member._id); // mb ning id si mavjud bolsa uni shape qil deyabman, mongoose o'qiydigan shakilda


            // data ma'lumotlarni, har bittasini item bilan qabul qilib loop qilyabman
            data.map((item) => {             // asosiy maqsad order_total amount ni hisoblash olish
                order_total_amount = item ["quantity"] * item ["price"];
            });

            // bu yerda total cost 100 dan kam bolsa delivery cost ni belgilayabman agar ko'p bolsa delivery free qoyabman
            if (order_total_amount < 100) {
                delivery_cost = 2;
                order_total_amount += delivery_cost;
            }

            // saveOrderData methodini yaratib olyabman
            const order_id = await this.saveOrderData( // 3 xil argument qiymat kiritib unlarni  order_id ga tenglayabman
                order_total_amount,
                delivery_cost,
                mb_id
            );
            console.log("order_id:::::", order_id);

            //todo order items creation

            // database schema_model bilan birga ishlaydigani uchun await method shaklida yaratib oldim va order_id va data ni path qilib oldim
            await this.recordOrderItemsData(order_id, data);   // orderItem ni creat qilish shu yerdan boshlandi


            return order_id;
        } catch (err) {
            throw err;
        }
    };


    // database va schema_model bn ishlayotgani uchun async ko'rishida saveOrderData method yaratib oldim
    async saveOrderData(order_total_amount, delivery_cost, mb_id) { // saveOrderData methodiga  3 ta parametrini  amount, cost va id ni path qilyabman
        try {
            console.log("saveOrderData is working");
            // xop bu yerda this.order_schema modeldan instance olib new_order object ini hosil qilib olyabman.
            const new_order = new this.orderModel({ // this order_schema modelda order amount, cost va id larni tenglashtirib natijaji new_order objectga path qilyabman
                order_total_amount: order_total_amount,
                order_delivery_cost: delivery_cost,
                mb_id: mb_id,
            });

            const result = await new_order.save(); // new_order objectinig save methodi yaratib natinijani resultga tenlayabman
            assert.ok(result, Definer.order_err1);

            return result._id;
        } catch (err) {
            // mongoose ko'rsatadigan errorlar farq qilganligi sababli ularni cutimize qilish maqsadida o'zimiz error larni qayta nomlayabmiz
            console.log(err);
            throw new Error(Definer.order_err1);
        }
    };


    // database va schema_model bn ishlayotgani uchun async ko'rishida recordOrderItemsData method yaratib oldim
    async recordOrderItemsData(order_id, data) {
        try {  // bu method da kirib keladigan data ni har bir elementini maping qilyabman
            // item orqali har birini qiymatini olayabman
            console.log("recordOrderItemsData is working");

            const pro_list = data.map(async (item) => {    // map ni ichida promise larni yasab olib natijasini  pro_list da path qilyabman

                // database bn ishlaydigani uchun await shakilda saveOrderItemsData methodini yaratim va item va order_id ni path qilyabman
                return await this.saveOrderItemsData(item, order_id);
            });

            // data base bn ishladigani uchun await ko'rinishida methodni yaratib parametr pro_list ni path qilyabmiz va natijani resltga tenglayabman
            const results = await Promise.all(pro_list); // Promise.all ma'nosi promise lar tugamaguncha kut degna ma'noni anglatadi
            console.log("results:::", results);

        } catch (err) {
            throw err;
        }
    };

    // database va schema_model bn ishlayotgani uchun async ko'rishida saveOrderItemsData method yaratib oldim
    async saveOrderItemsData(item, order_id) {  // saveOrderItemsData methodiga  2 ta parametrini  item va  order_id ni path qilyabman
        try { // bu yerda saveOrderItemsData method tidan maqsad  itemsData dan keladigan datani databasga save qilish
            console.log("saveOrderItemsData is working");

            order_id = shapeIntoMongooseObjectId(order_id); // keladigan order_id ini shape qilyabman
            item._id = shapeIntoMongooseObjectId(item._id); // item ni ichida keladigan id ini shape qilib qaytib o'ziga yozib olyabman


            // this.orderItem_schema model orqali instance olib order_item object ini yaratib olib uning ichiga
            const order_item = new this.OrderItemModel({ // shape qilingan dan data larni path qilyabman
                item_quantity: item["quantity"],
                item_price: item["price"],
                order_id: order_id,
                product_id: item["_id"],
            });
            // database bn ishlaydigani uchun await shakilda yozyabman
            const result = await order_item.save(); // order_item object ini save methotini ishlatib natijani result ga tenglayabman
            // pastda natijani tekshiryabman
            assert.ok(result, Definer.order_err2); // agar resultda data mavjud bolmasa deyabman
            return "created";  // saveOrderItemsData method ishlaydiganini tekshirish maqsadida

        } catch (err) {
            // mongoose ko'rsatadigan errorlar farq qilganligi sababli ularni custimize qilish maqsadida o'zimiz error larni qayta nomlayabmiz
            console.log(err);
            throw new Error(Definer.order_err2);
        }
    };

}

module.exports = Order;