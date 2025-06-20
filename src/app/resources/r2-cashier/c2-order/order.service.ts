// service.ts
// =========================================================================>> Core Library
import { BadRequestException, Injectable } from '@nestjs/common';

// =========================================================================>> Third Party Library
import { Sequelize, Transaction } from 'sequelize';

// =========================================================================>> Custom Library
import { NotificationsGateway } from '@app/utils/notification-getway/notifications.gateway';
import Notifications from '@app/models/notification/notification.model';
import User from '@app/models/user/user.model';
import { TelegramService } from '@app/services/telegram.service';
import sequelizeConfig from 'src/config/sequelize.config';
import OrderDetails from 'src/app/models/order/detail.model';
import Order from 'src/app/models/order/order.model';
import Product from 'src/app/models/product/product.model';
import ProductType from 'src/app/models/setup/type.model';
import Promotion from 'src/app/models/setup/promotion.model'; // Import Promotion model
import { CreateOrderDto } from './order.dto';
import Payment from '@app/models/payment/payment.model';
import StockStatus from '@app/models/stock/stock_status.model';

// ======================================= >> Code Starts Here << ========================== //
@Injectable()
export class OrderService {
  constructor(
    private telegramService: TelegramService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

async getProducts(): Promise<{
  data: { id: number; name: string; products: Product[] }[];
}> {
  const data = await ProductType.findAll({
    attributes: ['id', 'name'],
    include: [
      {
        model: Product,
        attributes: [
          'id',
          'type_id',
          'name',
          'image',
          'unit_price',
          'code',
          'discount',
          'promotion_id',
          'qty', // Add qty here
        ],
        include: [
          {
            model: ProductType,
            attributes: ['name'],
          },
        ],
      },
    ],
    order: [['name', 'ASC']],
  });

  const dataFormat: { id: number; name: string; products: Product[] }[] = data.map((type) => ({
    id: type.id,
    name: type.name,
    products: type.products || [],
  }));

  return { data: dataFormat };
}

  

  async makeOrder(
  cashierId: number,
  body: CreateOrderDto,
): Promise<{ data: Order; message: string }> {
  const sequelize = new Sequelize(sequelizeConfig);
  let transaction: Transaction;

  try {
    transaction = await sequelize.transaction();

    // Create an order
    const order = await Order.create(
      {
        cashier_id: cashierId,
        platform: body.platform,
        sub_total_price: 0, // Initialize
        discount_price: 0, // Initialize
        total_price: 0, // Initialize
        receipt_number: await this._generateReceiptNumber(),
        ordered_at: null, // Will be updated later
      },
      { transaction },
    );

    // Calculate prices and create order details
    let subTotalPrice = 0;
    let discountPrice = 0;
    const cartItems = JSON.parse(body.cart); // Parse cart JSON

    // Validate stock availability first
    for (const [productId, qty] of Object.entries(cartItems)) {
      const product = await Product.findByPk(parseInt(productId), {
        include: [{ model: Promotion, as: 'promotion' }],
        transaction,
      });

      if (!product) {
        throw new BadRequestException(
          `Product with ID ${productId} not found.`,
        );
      }

      if (product.qty < Number(qty)) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.qty}, Requested: ${qty}`,
        );
      }
    }

    // Process order details and update quantities
    for (const [productId, qty] of Object.entries(cartItems)) {
      const product = await Product.findByPk(parseInt(productId), {
        include: [{ model: Promotion, as: 'promotion' }],
        transaction,
      });

      // Calculate item price and discount
      const itemPrice = Number(qty) * product.unit_price;
      let itemDiscount = 0;
      if (product.promotion && product.promotion.discount_value) {
        itemDiscount = itemPrice * (product.promotion.discount_value / 100);
      }

      // Add to totals
      subTotalPrice += itemPrice;
      discountPrice += itemDiscount;

      // Create OrderDetails
      await OrderDetails.create(
        {
          order_id: order.id,
          product_id: product.id,
          qty: Number(qty),
          unit_price: product.unit_price,
        },
        { transaction },
      );

      // Deduct product quantity
      const newQty = product.qty - Number(qty);
      
      // Update stock_status_id based on new quantity (if using StockStatus)
      const stockStatusId = await this.getStockStatusId(newQty); // Implement this method or reuse from StockService

      await Product.update(
        {
          qty: newQty,
          stock_status_id: stockStatusId, // Optional, if using StockStatus
        },
        {
          where: { id: product.id },
          transaction,
        },
      );
    }

    // Calculate total_price
    const totalPrice = subTotalPrice - discountPrice;

    // Create Payment record
    const payment = await Payment.create(
      {
        order_id: order.id,
        payment_method: body.payment_method,
        amount_paid: totalPrice,
        paid_at: new Date(),
      },
      { transaction },
    );

    // Update Order with prices and payment_id
    await Order.update(
      {
        sub_total_price: subTotalPrice,
        discount_price: discountPrice,
        total_price: totalPrice,
        ordered_at: new Date(),
        payment_id: payment.id,
      },
      {
        where: { id: order.id },
        transaction,
      },
    );

    // Create notification
    await Notifications.create(
      {
        order_id: order.id,
        user_id: cashierId,
        read: false,
      },
      { transaction },
    );

    // Fetch order details for response
    const data: Order = await Order.findByPk(order.id, {
      attributes: [
        'id',
        'receipt_number',
        'sub_total_price',
        'discount_price',
        'total_price',
        'platform',
        'ordered_at',
      ],
      include: [
        {
          model: OrderDetails,
          attributes: ['id', 'unit_price', 'qty'],
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'code', 'image'],
              include: [
                {
                  model: ProductType,
                  attributes: ['name'],
                },
              ],
            },
          ],
        },
        {
          model: User,
          attributes: ['id', 'avatar', 'name'],
        },
        {
          model: Payment,
          attributes: ['payment_method'],
        },
      ],
      transaction,
    });

    await transaction.commit();

    // Prepare Telegram message
    const currentDateTime = await this.getCurrentDateTimeInCambodia();
    let htmlMessage = `<b>ការបញ្ជាទិញទទួលបានជោគជ័យ!</b>\n`;
    htmlMessage += `- លេខវិកយប័ត្រ \u2003 ៖ ${data.receipt_number}\n`;
    htmlMessage += `- តម្លៃសរុបមុនបញ្ចុះតម្លៃ \u2003 ៖ ${this.formatPrice(data.sub_total_price)} ៛\n`;
    htmlMessage += `- បញ្ចុះតម្លៃ \u2003 ៖ ${this.formatPrice(data.discount_price)} ៛\n`;
    htmlMessage += `- តម្លៃសរុប \u2003 ៖ ${this.formatPrice(data.total_price)} ៛\n`;
    htmlMessage += `- វិធីបង់ប្រាក់ \u2003 ៖ ${data.payment?.payment_method || ''}\n`;
    htmlMessage += `- អ្នកគិតលុយ \u2003 ៖ ${data.cashier?.name || ''}\n`;
    htmlMessage += `- តាមរយៈ \u2003 ៖ ${body.platform || ''}\n`;
    htmlMessage += `- កាលបរិច្ឆេទ \u2003 ៖ ${currentDateTime}\n`;

    await this.telegramService.sendHTMLMessage(htmlMessage);

    // Update notifications
    const notifications = await Notifications.findAll({
      attributes: ['id', 'read'],
      include: [
        {
          model: Order,
          attributes: [
            'id',
            'receipt_number',
            'sub_total_price',
            'discount_price',
            'total_price',
            'ordered_at',
          ],
          include: [{ model: Payment, attributes: ['payment_method'] }],
        },
        {
          model: User,
          attributes: ['id', 'avatar', 'name'],
        },
      ],
      order: [['id', 'DESC']],
    });

    const dataNotifications = notifications.map((notification) => ({
      id: notification.id,
      receipt_number: notification.order.receipt_number,
      sub_total_price: notification.order.sub_total_price,
      discount_price: notification.order.discount_price,
      total_price: notification.order.total_price,
      payment_method: notification.order.payment?.payment_method,
      ordered_at: notification.order.ordered_at,
      cashier: {
        id: notification.user.id,
        name: notification.user.name,
        avatar: notification.user.avatar,
      },
      read: notification.read,
    }));

    this.notificationsGateway.sendOrderNotification({
      data: dataNotifications,
    });

    return { data, message: 'The order has been successful.' };
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('Error during order creation:', error);
    throw new BadRequestException(
      'Something went wrong! Please try again later.',
      'Error during order creation.',
    );
  } finally {
    await sequelize.close();
  }
}

// Add this helper method to OrderService (or reuse from StockService)
private async getStockStatusId(qty: number): Promise<number> {
  const statuses = await StockStatus.findAll({
    attributes: ['id', 'min_items', 'max_items'],
    order: [['min_items', 'ASC']],
  });
  for (const status of statuses) {
    if (qty >= status.min_items && qty <= status.max_items) {
      return status.id;
    }
  }
  return statuses[0]?.id || null;
}

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }

  private async getCurrentDateTimeInCambodia(): Promise<string> {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Phnom_Penh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const parts = formatter.formatToParts(now);
    const day = parts.find((p) => p.type === 'day')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const year = parts.find((p) => p.type === 'year')?.value;
    const hour = parts.find((p) => p.type === 'hour')?.value;
    const minute = parts.find((p) => p.type === 'minute')?.value;
    const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value;
    return `${day}/${month}/${year} ${hour}:${minute} ${dayPeriod}`;
  }

  private async _generateReceiptNumber(): Promise<string> {
    const number = Math.floor(Math.random() * 9000000) + 1000000;
    return await Order.findOne({
      where: {
        receipt_number: number + '',
      },
    }).then((order) => {
      if (order) {
        return this._generateReceiptNumber();
      }
      return number + '';
    });
  }
}
