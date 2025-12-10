import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductVariant, ProductVariantDocument, VariantType } from '../schemas/product-variant.schema';
import { VariantAttributeDefinition, VariantAttributeDefinitionDocument } from '../schemas/variant-attribute-definition.schema';
import { 
  CreateProductVariantDto, 
  UpdateProductVariantDto, 
  BulkUpdateVariantsDto,
  VariantFilterDto 
} from '../dto/product-variant.dto';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectModel(ProductVariant.name)
    private variantModel: Model<ProductVariantDocument>,
    @InjectModel(VariantAttributeDefinition.name)
    private attributeDefinitionModel: Model<VariantAttributeDefinitionDocument>,
  ) {}

  async create(createVariantDto: CreateProductVariantDto): Promise<ProductVariant> {
    // Validate SKU uniqueness
    const existingVariant = await this.variantModel.findOne({ sku: createVariantDto.sku });
    if (existingVariant) {
      throw new BadRequestException('SKU already exists');
    }

    // Validate attribute definitions exist
    await this.validateAttributes(createVariantDto.attributes);

    // Generate variant title if not provided
    if (!createVariantDto.variantTitle) {
      createVariantDto.variantTitle = this.generateVariantTitle(createVariantDto.attributes);
    }

    // If this is set as default, remove default from other variants of the same product
    if (createVariantDto.isDefault) {
      await this.variantModel.updateMany(
        { productId: createVariantDto.productId },
        { isDefault: false }
      );
    }

    const variant = new this.variantModel(createVariantDto);
    return variant.save();
  }

  async findAll(filters: VariantFilterDto = {}, page = 1, limit = 20): Promise<{
    variants: ProductVariant[];
    total: number;
    totalPages: number;
  }> {
    const query = this.buildFilterQuery(filters);
    const skip = (page - 1) * limit;

    const [variants, total] = await Promise.all([
      this.variantModel
        .find(query)
        .populate('productId', 'name slug category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.variantModel.countDocuments(query),
    ]);

    return {
      variants,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByProductId(productId: string, includeInactive = false): Promise<ProductVariant[]> {
    const query: any = { productId: new Types.ObjectId(productId) };
    
    if (!includeInactive) {
      query.isActive = true;
    }

    return this.variantModel
      .find(query)
      .sort({ isDefault: -1, sortOrder: 1, createdAt: 1 })
      .lean();
  }

  async findOne(id: string): Promise<ProductVariant> {
    const variant = await this.variantModel
      .findById(id)
      .populate('productId', 'name slug category')
      .lean();

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return variant;
  }

  async findBySku(sku: string): Promise<ProductVariant> {
    const variant = await this.variantModel
      .findOne({ sku })
      .populate('productId', 'name slug category')
      .lean();

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return variant;
  }

  async update(id: string, updateVariantDto: UpdateProductVariantDto): Promise<ProductVariant> {
    // Check if SKU is being updated and validate uniqueness
    if (updateVariantDto.sku) {
      const existingVariant = await this.variantModel.findOne({ 
        sku: updateVariantDto.sku,
        _id: { $ne: id }
      });
      if (existingVariant) {
        throw new BadRequestException('SKU already exists');
      }
    }

    // Validate attributes if provided
    if (updateVariantDto.attributes) {
      await this.validateAttributes(updateVariantDto.attributes);
      // Regenerate variant title
      updateVariantDto.variantTitle = this.generateVariantTitle(updateVariantDto.attributes);
    }

    // If this is set as default, remove default from other variants of the same product
    if (updateVariantDto.isDefault) {
      const variant = await this.variantModel.findById(id);
      if (variant) {
        await this.variantModel.updateMany(
          { productId: variant.productId, _id: { $ne: id } },
          { isDefault: false }
        );
      }
    }

    const updatedVariant = await this.variantModel
      .findByIdAndUpdate(id, updateVariantDto, { new: true })
      .populate('productId', 'name slug category')
      .lean();

    if (!updatedVariant) {
      throw new NotFoundException('Product variant not found');
    }

    return updatedVariant;
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdateVariantsDto): Promise<{ modifiedCount: number }> {
    const result = await this.variantModel.updateMany(
      { _id: { $in: bulkUpdateDto.variantIds } },
      bulkUpdateDto.updates
    );

    return { modifiedCount: result.modifiedCount };
  }

  async updateStock(id: string, stock: number): Promise<ProductVariant> {
    const updatedVariant = await this.variantModel
      .findByIdAndUpdate(
        id,
        { stock: Math.max(0, stock) },
        { new: true }
      )
      .lean();

    if (!updatedVariant) {
      throw new NotFoundException('Product variant not found');
    }

    return updatedVariant;
  }

  async incrementSales(id: string, quantity = 1): Promise<ProductVariant> {
    const updatedVariant = await this.variantModel
      .findByIdAndUpdate(
        id,
        { $inc: { salesCount: quantity } },
        { new: true }
      )
      .lean();

    if (!updatedVariant) {
      throw new NotFoundException('Product variant not found');
    }

    return updatedVariant;
  }

  async delete(id: string): Promise<void> {
    const result = await this.variantModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Product variant not found');
    }
  }

  async deleteByProductId(productId: string): Promise<void> {
    await this.variantModel.deleteMany({ productId: new Types.ObjectId(productId) });
  }

  // Advanced filtering methods
  async findByAttributes(
    productId: string,
    attributeFilters: { [attributeType: string]: string[] }
  ): Promise<ProductVariant[]> {
    const matchConditions = Object.entries(attributeFilters).map(([type, values]) => ({
      'attributes': {
        $elemMatch: {
          'type': type,
          'value': { $in: values }
        }
      }
    }));

    return this.variantModel
      .find({
        productId: new Types.ObjectId(productId),
        isActive: true,
        $and: matchConditions
      })
      .sort({ isDefault: -1, price: 1 })
      .lean();
  }

  async getVariantCombinations(productId: string): Promise<{
    attributes: { [type: string]: string[] };
    combinations: ProductVariant[];
  }> {
    const variants = await this.findByProductId(productId, false);
    
    const attributes: { [type: string]: Set<string> } = {};
    
    variants.forEach(variant => {
      variant.attributes.forEach(attr => {
        if (!attributes[attr.type]) {
          attributes[attr.type] = new Set();
        }
        attributes[attr.type].add(attr.value);
      });
    });

    // Convert Sets to arrays
    const attributeMap: { [type: string]: string[] } = {};
    Object.entries(attributes).forEach(([type, valueSet]) => {
      attributeMap[type] = Array.from(valueSet).sort();
    });

    return {
      attributes: attributeMap,
      combinations: variants
    };
  }

  async getLowStockVariants(threshold?: number): Promise<ProductVariant[]> {
    const query: any = {
      isActive: true,
      trackQuantity: true,
      $expr: {
        $lte: ['$stock', threshold ? threshold : { $ifNull: ['$lowStockThreshold', 10] }]
      }
    };

    return this.variantModel
      .find(query)
      .populate('productId', 'name slug')
      .sort({ stock: 1 })
      .lean();
  }

  async getVariantAnalytics(productId?: string): Promise<{
    totalVariants: number;
    activeVariants: number;
    averagePrice: number;
    totalStock: number;
    totalSales: number;
    topSellingVariants: ProductVariant[];
  }> {
    const query = productId ? { productId: new Types.ObjectId(productId) } : {};

    const [stats, topSelling] = await Promise.all([
      this.variantModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalVariants: { $sum: 1 },
            activeVariants: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            },
            averagePrice: { $avg: '$price' },
            totalStock: { $sum: '$stock' },
            totalSales: { $sum: '$salesCount' }
          }
        }
      ]),
      this.variantModel
        .find(query)
        .sort({ salesCount: -1 })
        .limit(5)
        .populate('productId', 'name slug')
        .lean()
    ]);

    const result = stats[0] || {
      totalVariants: 0,
      activeVariants: 0,
      averagePrice: 0,
      totalStock: 0,
      totalSales: 0
    };

    return {
      ...result,
      topSellingVariants: topSelling
    };
  }

  // Helper methods
  private async validateAttributes(attributes: any[]): Promise<void> {
    const attributeTypes = attributes.map(attr => attr.type);
    const definitions = await this.attributeDefinitionModel
      .find({ type: { $in: attributeTypes }, isActive: true })
      .lean();

    const definitionMap = new Map(definitions.map(def => [def.type, def]));

    for (const attr of attributes) {
      const definition = definitionMap.get(attr.type);
      if (!definition) {
        throw new BadRequestException(`Invalid attribute type: ${attr.type}`);
      }

      const validValues = definition.options
        .filter(opt => opt.isActive)
        .map(opt => opt.value);

      if (!validValues.includes(attr.value)) {
        throw new BadRequestException(
          `Invalid value '${attr.value}' for attribute '${attr.type}'. Valid values: ${validValues.join(', ')}`
        );
      }
    }
  }

  private generateVariantTitle(attributes: any[]): string {
    return attributes
      .map(attr => attr.displayValue || attr.value)
      .join(' - ');
  }

  private buildFilterQuery(filters: VariantFilterDto): any {
    const query: any = {};

    if (filters.productId) {
      query.productId = new Types.ObjectId(filters.productId);
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.inStock) {
      query.stock = { $gt: 0 };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = filters.maxPrice;
      }
    }

    if (filters.attributeFilters && Object.keys(filters.attributeFilters).length > 0) {
      const attributeConditions = Object.entries(filters.attributeFilters).map(([type, values]) => ({
        'attributes': {
          $elemMatch: {
            'type': type,
            'value': { $in: values }
          }
        }
      }));

      if (attributeConditions.length > 0) {
        query.$and = attributeConditions;
      }
    }

    return query;
  }
}
