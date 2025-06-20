// ================================================================>> Core Library
import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
// ================================================================>> Custom Library
import { JsReportService } from '@app/services/js-report.service';
import OrderDetails from '@app/models/order/detail.model';
import Order from '@app/models/order/order.model';
import User from '@app/models/user/user.model';
import { Op } from 'sequelize';
import { SaleService } from '@app/resources/r2-cashier/c1-sale/sale.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly jsReportService: JsReportService,
    private readonly saleService: SaleService,
  ) {}

  async generateSaleReportBaseOnStartDateAndEndDate(
    startDate: string,
    endDate: string,
    userId: number,
  ) {
    const { start, end } = this.getStartAndEndDateInCambodia(
      startDate || this.getCurrentDate(),
      endDate || this.getCurrentDate(),
    );
    const user = await this.fetchUser(userId);
    const orders = await this.fetchOrders(start, end);

    const sumTotalPrice = this.calculateTotal(orders, 'total_price');
    const formattedOrders = this.formatOrderData(orders);

    const reportData = this.buildReportData(
      user,
      sumTotalPrice,
      formattedOrders,
      start,
      end,
    );

    return this.generateAndSendReport(
      reportData,
      process.env.JS_TEMPLATE_INVOICE,
      'Sale Report',
      'របាយការណ៍លក់រាយ',
    );
  }

  async generateInvoiceById(id: number, userId: number) {
    const user = await this.fetchUser(userId);
    const orderData = await this.saleService.view(id);

    if (!orderData || !orderData.data) {
      throw new BadRequestException('Order not found.');
    }

    const order = orderData.data;
    if (!order.details || !Array.isArray(order.details)) {
      throw new BadRequestException('Order details are missing or invalid.');
    }

    const orderedAt = new Date(order.ordered_at);
    if (isNaN(orderedAt.getTime())) {
      throw new BadRequestException('Invalid order date.');
    }

    const date = orderedAt.toISOString().split('T')[0];
    const time = orderedAt
      .toLocaleTimeString('en-US', {
        hour12: false,
        timeZone: 'Asia/Phnom_Penh',
      })
      .substring(0, 5);

    const subtotal = order.details.reduce(
      (sum, detail) => sum + Number(detail.unit_price) * Number(detail.qty),
      0,
    );

    const discount = subtotal - Number(order.total_price);

    const reportData = {
      invoiceNumber: order.receipt_number || 'N/A',
      cashier: order.cashier?.name || 'Unknown',
      date,
      time,
      paymentMethod: order.payment?.payment_method || 'N/A',
      products: order.details.map((detail) => {
        if (
          !detail.product ||
          !detail.product.name ||
          detail.unit_price == null ||
          detail.qty == null
        ) {
          throw new BadRequestException('Invalid product details in order.');
        }
        return {
          name: detail.product.name,
          price: Number(detail.unit_price),
          quantity: Number(detail.qty),
        };
      }),
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total: Number(Number(order.total_price).toFixed(2)),
    };

    return this.generateAndSendReport(
      reportData,
      process.env.JS_TEMPLATE_INVOICE,
      'Invoice',
      'វិក្កយបត្រ',
    );
  }

  private async fetchUser(userId: number) {
    const user = await User.findByPk(userId);
    if (!user) throw new BadRequestException('User not found.');
    return user;
  }

  private async fetchOrders(startDate: Date, endDate: Date) {
    return Order.findAll({
      where: { ordered_at: { [Op.between]: [startDate, endDate] } },
      attributes: ['id', 'receipt_number', 'total_price', 'ordered_at'],
      include: [
        { model: OrderDetails, attributes: ['id', 'unit_price', 'qty'] },
        { model: User, attributes: ['id', 'avatar', 'name'] },
      ],
      order: [['id', 'ASC']],
    });
  }

  private calculateTotal(items: any[], field: string): number {
    return items.reduce((sum, item) => sum + Number(item[field] || 0), 0);
  }

  private formatOrderData(orders: Order[]) {
    return orders.map((order) => ({
      id: order.id,
      receipt_number: order.receipt_number,
      total_price: order.total_price,
      ordered_at: order.ordered_at,
      cashier: order.cashier
        ? {
            id: order.cashier.id,
            avatar: order.cashier.avatar,
            name: order.cashier.name,
          }
        : null,
    }));
  }

  private buildReportData(
    user: User,
    totalSales: number,
    data: any[],
    startDate: Date,
    endDate: Date,
    totalQty = 0,
  ) {
    const now = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Phnom_Penh',
      hour12: true,
    });

    return {
      currentDate: now.split(',')[0],
      currentTime: now.split(',')[1].trim(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      name: user.name,
      SumTotalPrice: totalSales,
      SumTotalSale: totalQty,
      data,
    };
  }

  private getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getStartAndEndDateInCambodia(startDate: string, endDate: string) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    start.setHours(start.getHours() - start.getTimezoneOffset() / 60 + 7);
    end.setHours(end.getHours() - end.getTimezoneOffset() / 60 + 7);

    return { start, end };
  }

  private async generateAndSendReport(
    reportData: any,
    template: string,
    fileName: string,
    content: string,
    timeout: number = 30 * 1000,
  ) {
    try {
      const result = await this.withTimeout(
        this.jsReportService.generateReport(template, reportData),
        timeout,
      );
      if (result.error)
        throw new BadRequestException('Report generation failed.');
      return {
        status: 'success',
        data: result.data,
        contentType: 'application/pdf',
      };
    } catch (error) {
      if (error instanceof RequestTimeoutException) {
        throw new RequestTimeoutException(
          'Request Timeout: Report generation took too long.',
        );
      }
      throw new BadRequestException(
        error.message || 'Failed to generate and send the report.',
      );
    }
  }

  private withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () =>
          reject(
            new RequestTimeoutException(
              'Request Timeout: Operation took too long.',
            ),
          ),
        timeout,
      );
      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }
}