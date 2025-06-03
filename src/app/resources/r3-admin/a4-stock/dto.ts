import ProductType from "@app/models/setup/type.model";


export class createStockDto{

    avatar : string;
    name : string;
    product_typ : ProductType[];
    quanity : number;
    purchase_price : number

}