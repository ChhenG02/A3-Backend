    import { MetaData } from "./response.dto";

    export interface PaginationParams {
        page?: number;      
        limit?: number;  
        sort?: string; 
        order?: 'ASC' | 'DESC';
    }

    export interface PaginationMeta extends MetaData {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    }