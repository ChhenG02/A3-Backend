
import UsersLogs from "src/app/models/user/user_logs.model";
import { Pagination } from "src/app/shared/pagination.interface";


export interface List {
    status: string;
    data: UsersLogs[];
    pagination: Pagination;
}
