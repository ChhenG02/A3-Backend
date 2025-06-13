import { Pagination } from "@app/shared/pagination.interface";
import Order from "@app/models/order/order.model";

export interface List {
    status: string;
    data: Order[];
    pagination: {
        currentPage: number;
        perPage: number;
        totalItems: number;
        totalPages: number;
    };
}