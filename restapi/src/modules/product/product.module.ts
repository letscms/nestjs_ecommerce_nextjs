import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { InventoryService } from './services/inventory.service';
import { ProductVariantService } from './services/product-variant.service';
import { VariantAttributeDefinitionService } from './services/variant-attribute-definition.service';
import { ProductController } from './controllers/product.controller';
import { CategoryController } from './controllers/category.controller';
import { InventoryController } from './controllers/inventory.controller';
import { ProductVariantController } from './controllers/product-variant.controller';
import { VariantAttributeDefinitionController } from './controllers/variant-attribute-definition.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { ProductVariant, ProductVariantSchema } from './schemas/product-variant.schema';
import { VariantAttributeDefinition, VariantAttributeDefinitionSchema } from './schemas/variant-attribute-definition.schema';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { I18nModule } from '../../i18n/i18n.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: VariantAttributeDefinition.name, schema: VariantAttributeDefinitionSchema },
      { name: Inventory.name, schema: InventorySchema },
    ]),
    I18nModule,
  ],
  controllers: [
    ProductController, 
    CategoryController, 
    InventoryController,
    ProductVariantController,
    VariantAttributeDefinitionController,
  ],
  providers: [
    ProductService, 
    CategoryService, 
    InventoryService,
    ProductVariantService,
    VariantAttributeDefinitionService,
  ],
  exports: [
    ProductService, 
    CategoryService, 
    InventoryService,
    ProductVariantService,
    VariantAttributeDefinitionService,
  ],
})
export class ProductModule {}