import Product from '@app/models/product/product.model';
import ProductType from '@app/models/setup/type.model';

export class ProductSeeder {
  public static async seed() {
    try {
      await ProductSeeder.seedProductTypes();
      await ProductSeeder.seedProducts();
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

  private static async seedProducts() {
    try {
      await Product.bulkCreate(productSeederData.products);
      console.log('\x1b[32mProducts inserted successfully.');
    } catch (error) {
      console.error('Error seeding products:', error);
      throw error;
    }
  }
}

// Mock data for products and product types
const productSeederData = {
  types: [
    { name: 'nintendo', image: 'static/pos/products/type/nintendo.png' },
    {
      name: 'handheld-game',
      image: 'static/pos/products/type/handheld-game.png',
    },
    {
      name: 'play-station',
      image: 'static/pos/products/type/play-station.png',
    },
    {
      name: 'xbox',
      image: 'static/pos/products/type/xbox.png',
    },
  ],
  products: [
    {
      code: 'N001',
      type_id: 1,
      name: 'Mario Kart',
      unit_price: 5,
      image: 'static/pos/products/nintendo/mario-kart.png',
      creator_id: 1,
    },
    {
      code: 'N002',
      type_id: 1,
      name: 'Pokemon',
      unit_price: 5,
      image: 'static/pos/products/nintendo/pokemon.png',
      creator_id: 1,
    },
    {
      code: 'N003',
      type_id: 1,
      name: 'Supser Smash Bros',
      unit_price: 5,
      image: 'static/pos/products/nintendo/super-smash-bros.png',
      creator_id: 1,
    },
    {
      code: 'N004',
      type_id: 1,
      name: 'The Legend of Zelda: Breath of the Wild',
      unit_price: 5,
      image: 'static/pos/products/nintendo/zelda.png',
      creator_id: 1,
    },
    {
      code: 'H001',
      type_id: 2,
      name: 'PS5 Controller',
      unit_price: 3,
      image: 'static/pos/products/handheld-game/ps5-controller.png',
      creator_id: 1,
    },
    {
      code: 'H002',
      type_id: 2,
      name: 'ROG Ally X',
      unit_price: 2,
      image: 'static/pos/products/handheld-game/rog-ally-x.png',
      creator_id: 1,
    },
    {
      code: 'H003',
      type_id: 2,
      name: 'Xbox Series X Controller',
      unit_price: 3,
      image: 'static/pos/products/handheld-game/xbox-series-x.png',
      creator_id: 1,
    },
    {
      code: 'H004',
      type_id: 2,
      name: 'Steam Deck OLED',
      unit_price: 4,
      image: 'static/pos/products/handheld-game/steam-deck-oled.png',
      creator_id: 1,
    },
    {
      code: 'P001',
      type_id: 3,
      name: 'Elden Ring',
      unit_price: 3,
      image: 'static/pos/products/play-station/elden-ring.png',
      creator_id: 1,
    },
    {
      code: 'P002',
      type_id: 3,
      name: 'God of War: Ragnarok',
      unit_price: 6,
      image: 'static/pos/products/play-station/god-of-war.png',
      creator_id: 1,
    },
    {
      code: 'P003',
      type_id: 3,
      name: 'Red Dead Redemption 2',
      unit_price: 4,
      image: 'static/pos/products/play-station/red-dead-redemption.png',
      creator_id: 1,
    },
    {
      code: 'P004',
      type_id: 3,
      name: 'Spider Man',
      unit_price: 5,
      image: 'static/pos/products/play-station/spider-man.png',
      creator_id: 1,
    },
    {
      code: 'X001',
      type_id: 4,
      name: 'Cyberpunk 2077',
      unit_price: 5,
      image: 'static/pos/products/xbox/cyberpunk.png',
      creator_id: 1,
    },
    {
      code: 'X002',
      type_id: 4,
      name: 'Grand Theft Auto V',
      unit_price: 3,
      image: 'static/pos/products/xbox/gta-5.png',
      creator_id: 1,
    },
    {
      code: 'X003',
      type_id: 4,
      name: 'Read Dead Redemption 2',
      unit_price: 5,
      image: 'static/pos/products/xbox/red-dead-redemption.png',
      creator_id: 1,
    },
    {
      code: 'X004',
      type_id: 4,
      name: 'The Witcher 3: Wild Hunt',
      unit_price: 4,
      image: 'static/pos/products/xbox/witcher.png',
      creator_id: 1,
    },
  ],
};
