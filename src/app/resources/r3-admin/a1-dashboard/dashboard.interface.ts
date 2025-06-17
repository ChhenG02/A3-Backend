export interface DataTotalSale {
    total: number;
    totalPercentageIncrease: number;
    saleIncreasePreviousDay: string;
  }

  export interface TopProduct {
  id: number;
  name: string;
  image: string | null;
  totalSales: string; 
  totalAmountSales: string; 
}