import Product from '@app/models/product/product.model';
import ProductType from '@app/models/setup/type.model';
import StockStatus from '@app/models/stock/stock_status.model';
import Promotion from '@app/models/setup/promotion.model';

export class ProductSeeder {
  public static async seed() {
    try {
      await ProductSeeder.seedProductTypes();
      await ProductSeeder.seedStockStatuses();
      await ProductSeeder.seedPromotions();
      await ProductSeeder.seedProducts();
      console.log('\x1b[32mAll product-related data seeded successfully.');
    } catch (error) {
      console.error('\x1b[31m\nError seeding products:', error);
    }
  }

  private static async seedProductTypes() {
    try {
      await ProductType.bulkCreate(productSeederData.types);
      console.log('\x1b[32mProduct types inserted successfully.');
    } catch (error) {
      console.error('Error seeding product types:', error);
      throw error;
    }
  }

  private static async seedStockStatuses() {
    try {
      await StockStatus.bulkCreate(productSeederData.stockStatuses);
      console.log('\x1b[32mStock statuses inserted successfully.');
    } catch (error) {
      console.error('Error seeding stock statuses:', error);
      throw error;
    }
  }

  private static async seedPromotions() {
    try {
      await Promotion.bulkCreate(productSeederData.promotions);
      console.log('\x1b[32mPromotions inserted successfully.');
    } catch (error) {
      console.error('Error seeding promotions:', error);
      throw error;
    }
  }

  private static async seedProducts() {
    try {
      const products = await Product.bulkCreate(productSeederData.products);
      
      // Assign stock statuses based on quantity
      await ProductSeeder.assignStockStatuses(products);
      
      // Assign promotions to some products
      await ProductSeeder.assignPromotions(products);
      
      console.log('\x1b[32mProducts inserted with stock statuses and promotions.');
    } catch (error) {
      console.error('Error seeding products:', error);
      throw error;
    }
  }

  private static async assignStockStatuses(products: Product[]) {
    const statuses = await StockStatus.findAll({ order: [['min_items', 'DESC']] });
    
    for (const product of products) {
      if (product.qty === undefined) continue;
      
      for (const status of statuses) {
        if (product.qty >= status.min_items) {
          await product.update({ stock_status_id: status.id });
          break;
        }
      }
    }
  }

  private static async assignPromotions(products: Product[]) {
    const promotions = await Promotion.findAll();
    if (promotions.length === 0) return;
    
    // Assign promotions to first 3 products
    for (let i = 0; i < 3 && i < products.length; i++) {
      await products[i].update({ 
        promotion_id: promotions[i % promotions.length].id 
      });
    }
  }
}

// Mock data for products, types, stock statuses and promotions
const productSeederData = {
  types: [
    { name: 'nintendo', image: 'static/pos/products/type/nintendo.png' },
    { name: 'handheld-game', image: 'static/pos/products/type/handheld-game.png' },
    { name: 'play-station', image: 'static/pos/products/type/play-station.png' },
    { name: 'xbox', image: 'static/pos/products/type/xbox.png' },
  ],
  
  stockStatuses: [
    { 
      name: 'In Stock', 
      color: 'green', 
      avatar: 'static/pos/stock/in-stock.png',
      min_items: 5,
      max_items: 100, 
    },
    { 
      name: 'Low Stock', 
      color: 'orange', 
      avatar: 'static/pos/stock/low-stock.png',
      min_items: 1,
      max_items: 4 
    },
    { 
      name: 'Out of Stock', 
      color: 'red', 
      avatar: 'static/pos/stock/out-of-stock.png',
      min_items: 0,
      max_items: 1 
    },
  ],
  
  promotions: [
    {
      discount_value: 20,
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      creator_id: 1
    },
    {
      discount_value: 30,
      start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      creator_id: 1
    },
    {
      discount_value: 15,
      start_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      creator_id: 1
    }
  ],
  
  products: [
    {
      code: 'N001',
      type_id: 1,
      name: 'Mario Kart',
      unit_price: 59.99,
      purchase_price: 35.00,
      qty: 5, 
      discount: 0,
      image: 'static/pos/products/nintendo/mario-kart.png',
      creator_id: 1,
    },
    {
      code: 'N002',
      type_id: 1,
      name: 'Pokemon',
      unit_price: 49.99,
      purchase_price: 30.00,
      qty: 3, 
      discount: 0,
      image: 'static/pos/products/nintendo/pokemon.png',
      creator_id: 1,
    },
    {
      code: 'N003',
      type_id: 1,
      name: 'Super Smash Bros',
      unit_price: 54.99,
      purchase_price: 32.50,
      qty: 1,
      discount: 0,
      image: 'static/pos/products/nintendo/super-smash-bros.png',
      creator_id: 1,
    },
    {
      code: 'N004',
      type_id: 1,
      name: 'The Legend of Zelda: Breath of the Wild',
      unit_price: 69.99,
      purchase_price: 40.00,
      qty: 0,
      discount: 0,
      image: 'static/pos/products/nintendo/zelda.png',
      creator_id: 1,
    },
    {
      code: 'H001',
      type_id: 2,
      name: 'PS5 Controller',
      unit_price: 69.99,
      purchase_price: 45.00,
      qty: 8,
      discount: 0,
      image: 'static/pos/products/handheld-game/ps5-controller.png',
      creator_id: 1,
    },
    {
      code: 'H002',
      type_id: 2,
      name: 'ROG Ally X',
      unit_price: 699.99,
      purchase_price: 550.00,
      qty: 2,
      discount: 0,
      image: 'static/pos/products/handheld-game/rog-ally-x.png',
      creator_id: 1,
    },
    {
      code: 'H003',
      type_id: 2,
      name: 'Xbox Series X Controller',
      unit_price: 59.99,
      purchase_price: 40.00,
      qty: 4,
      discount: 0,
      image: 'static/pos/products/handheld-game/xbox-series-x.png',
      creator_id: 1,
    },
    {
      code: 'H004',
      type_id: 2,
      name: 'Steam Deck OLED',
      unit_price: 549.99,
      purchase_price: 450.00,
      qty: 0,
      discount: 0,
      image: 'static/pos/products/handheld-game/steam-deck-oled.png',
      creator_id: 1,
    },
    {
      code: 'P001',
      type_id: 3,
      name: 'Elden Ring',
      unit_price: 59.99,
      purchase_price: 35.00,
      qty: 7,
      discount: 0,
      image: 'static/pos/products/play-station/elden-ring.png',
      creator_id: 1,
    },
    {
      code: 'P002',
      type_id: 3,
      name: 'God of War: Ragnarok',
      unit_price: 69.99,
      purchase_price: 45.00,
      qty: 6,
      discount: 0,
      image: 'static/pos/products/play-station/god-of-war.png',
      creator_id: 1,
    },
    {
      code: 'P003',
      type_id: 3,
      name: 'Red Dead Redemption 2',
      unit_price: 39.99,
      purchase_price: 25.00,
      qty: 1,
      discount: 0,
      image: 'static/pos/products/play-station/red-dead-redemption.png',
      creator_id: 1,
    },
    {
      code: 'P004',
      type_id: 3,
      name: 'Spider Man',
      unit_price: 49.99,
      purchase_price: 30.00,
      qty: 0,
      discount: 0,
      image: 'static/pos/products/play-station/spider-man.png',
      creator_id: 1,
    },
    {
      code: 'X001',
      type_id: 4,
      name: 'Cyberpunk 2077',
      unit_price: 39.99,
      purchase_price: 25.00,
      qty: 3,
      discount: 0,
      image: 'static/pos/products/xbox/cyberpunk.png',
      creator_id: 1,
    },
    {
      code: 'X002',
      type_id: 4,
      name: 'Grand Theft Auto V',
      unit_price: 29.99,
      purchase_price: 20.00,
      qty: 10,
      discount: 0,
      image: 'static/pos/products/xbox/gta-5.png',
      creator_id: 1,
    },
    {
      code: 'X003',
      type_id: 4,
      name: 'Red Dead Redemption 2',
      unit_price: 39.99,
      purchase_price: 25.00,
      qty: 0,
      discount: 0,
      image: 'static/pos/products/xbox/red-dead-redemption.png',
      creator_id: 1,
    },
    {
      code: 'X004',
      type_id: 4,
      name: 'The Witcher 3: Wild Hunt',
      unit_price: 34.99,
      purchase_price: 22.00,
      qty: 2,
      discount: 0,
      image: 'static/pos/products/xbox/witcher.png',
      creator_id: 1,
    },
  ],
};