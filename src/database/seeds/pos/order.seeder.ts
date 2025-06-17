import OrderDetails from "@app/models/order/detail.model";
import Order from "@app/models/order/order.model";
import Payment from "@app/models/payment/payment.model";
import Product from "@app/models/product/product.model";

import Promotion from "@app/models/setup/promotion.model"; 

export class OrderSeeder {
    public static async seed() {
        try {
            await OrderSeeder.clearExistingPayments(); // Clear payments first
            await OrderSeeder.clearExistingOrders();
            await OrderSeeder.seedOrders();
            await OrderSeeder.seedOrderDetails();
            await OrderSeeder.seedPayments(); // Seed payments after orders
            console.log('\x1b[32mAll order-related data seeded successfully.');
        } catch (error) {
            console.error('\x1b[31m\nError seeding data for orders:', error);
        }
    }

    private static async clearExistingPayments() {
        try {
            const payments = await Payment.findAll();
            for (const payment of payments) {
                await payment.destroy();
            }
            console.log('\x1b[32mExisting payments cleared successfully.');
        } catch (error) {
            console.error('Error clearing existing payments:', error);
            throw error;
        }
    }

    private static async clearExistingOrders() {
        try {
            const orders = await Order.findAll();
            for (const order of orders) {
                await order.destroy();
            }
            console.log('\x1b[32mExisting orders cleared successfully.');
        } catch (error) {
            console.error('Error clearing existing orders:', error);
            throw error;
        }
    }

    private static async seedOrders() {
        const ordersData = [];

        for (let i = 1; i <= 100; i++) {
            const receiptNumber = await OrderSeeder.generateReceiptNumber();
            ordersData.push({
                receipt_number: receiptNumber + '',
                cashier_id: Math.floor(Math.random() * (4 - 1) + 1),
                sub_total_price: 0, // Initialize to 0
                discount_price: 0, // Initialize to 0
                total_price: 0, // Initialize to 0
                ordered_at: new Date(),
            });
        }

        try {
            await Order.bulkCreate(ordersData);
            console.log('\x1b[32mOrders data inserted successfully.');
        } catch (error) {
            console.error('Error seeding orders:', error);
            throw error;
        }
    }

    private static async seedOrderDetails() {
        try {
            const orders = await Order.findAll();

            for (const order of orders) {
                const orderDetails = await OrderSeeder.createOrderDetails(order.id);

                // Calculate sub_total_price (sum of unit_price * qty before discounts)
                const subTotalPrice = orderDetails.reduce(
                    (total, detail) => total + (detail.unit_price || 0) * (detail.qty || 0),
                    0
                );

                // Calculate discount_price (sum of discounts based on promotions)
                let discountPrice = 0;
                for (const detail of orderDetails) {
                    const product = await Product.findByPk(detail.product_id, {
                        include: [{ model: Promotion, as: 'promotion' }],
                    });
                    const promotion = product?.promotion;
                    if (promotion && promotion.discount_value) {
                        const itemPrice = (detail.unit_price || 0) * (detail.qty || 0);
                        const itemDiscount = itemPrice * (promotion.discount_value / 100);
                        discountPrice += itemDiscount;
                    }
                }

                // Calculate total_price (sub_total_price - discount_price)
                const totalPrice = subTotalPrice - discountPrice;

                // Create order details
                await OrderDetails.bulkCreate(orderDetails);

                // Update order with calculated prices
                await order.update({
                    sub_total_price: subTotalPrice,
                    discount_price: discountPrice,
                    total_price: totalPrice,
                });
            }

            console.log('\x1b[32mOrder details inserted successfully.');
        } catch (error) {
            console.error('Error seeding order details:', error);
            throw error;
        }
    }

    private static async seedPayments() {
        try {
            const orders = await Order.findAll();
            const paymentsData = [];

            for (const order of orders) {
                if (order.total_price === null || order.total_price === undefined) {
                    console.warn(`Skipping payment for order ${order.id} due to null total_price.`);
                    continue;
                }

                paymentsData.push({
                    order_id: order.id,
                    payment_method: Math.random() > 0.5 ? 'cash' : 'scanpay', // Randomly choose payment method
                    amount_paid: order.total_price,
                    paid_at: new Date(),
                });
            }

            const payments = await Payment.bulkCreate(paymentsData);

            // Update orders with payment_id
            for (let i = 0; i < orders.length; i++) {
                if (payments[i]) {
                    await orders[i].update({ payment_id: payments[i].id });
                }
            }

            console.log('\x1b[32mPayments data inserted successfully.');
        } catch (error) {
            console.error('Error seeding payments:', error);
            throw error;
        }
    }

    private static async createOrderDetails(orderId: number) {
        const details = [];
        const nOfDetails = Math.floor(Math.random() * (7 - 2 + 1) + 2);

        const products = await Product.findAll();
        const productIds = products.map(product => product.id);

        for (let i = 0; i < nOfDetails; i++) {
            const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
            const product = products.find(p => p.id === randomProductId);

            if (!product) {
                console.error(`Product with id ${randomProductId} not found.`);
                continue;
            }

            const qty = Math.floor(Math.random() * 10) + 1;

            details.push({
                order_id: orderId,
                product_id: product.id,
                unit_price: product.unit_price,
                qty: qty,
            });
        }

        return details;
    }

    private static async generateReceiptNumber() {
        const number = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        const existingOrder = await Order.findOne({ where: { receipt_number: number + '' } });

        if (existingOrder) {
            return this.generateReceiptNumber();
        }

        return number;
    }
}