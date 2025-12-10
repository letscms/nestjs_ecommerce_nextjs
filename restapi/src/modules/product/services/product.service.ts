import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductQueryDto } from '../dto/product-query.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if SKU already exists
    const existingProduct = await this.productModel.findOne({
      sku: createProductDto.sku
    });

    if (existingProduct) {
      throw new BadRequestException('SKU already exists');
    }

    const product = new this.productModel(createProductDto);
    return await product.save();
  }

  async findAll(query: ProductQueryDto): Promise<{ products: Product[], total: number, totalPages: number }> {
    const { page = 1, limit = 10, search, category, minPrice, maxPrice, sortBy, sortOrder } = query;
    
    const filter: any = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.categoryId = new Types.ObjectId(category);
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      filter.price = { $gte: minPrice, $lte: maxPrice };
    }

    const sortOptions: any = {};
    const sortField = sortBy || 'createdAt';
    sortOptions[sortField] = sortOrder === 'ASC' ? 1 : -1;

    const products = await this.productModel
      .find(filter)
      .populate('categoryId', 'name slug')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.productModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return { products, total, totalPages };
  }

  async findOne(id: string): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel
      .findById(id)
      .populate('categoryId', 'name slug')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productModel.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return product;
  }

  async findBySku(sku: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ sku })
      .populate('categoryId', 'name slug')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    // Check SKU uniqueness if being updated
    if (updateProductDto.sku) {
      const existingProduct = await this.productModel.findOne({
        sku: updateProductDto.sku,
        _id: { $ne: id }
      });

      if (existingProduct) {
        throw new BadRequestException('SKU already exists');
      }
    }

    const product = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .populate('categoryId', 'name slug')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock + quantity < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id, 
        { $inc: { stock: quantity } }, 
        { new: true }
      )
      .populate('categoryId', 'name slug')
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async getLowStockProducts(threshold?: number): Promise<Product[]> {
    const filter: any = { isActive: true };

    if (threshold) {
      filter.stock = { $lte: threshold };
    } else {
      filter.$expr = { $lte: ['$stock', '$minStock'] };
    }

    return await this.productModel
      .find(filter)
      .populate('categoryId', 'name slug')
      .exec();
  }

  async getTopSellingProducts(limit: number = 10): Promise<Product[]> {
    return await this.productModel
      .find({ isActive: true })
      .populate('categoryId', 'name slug')
      .sort({ sales: -1 })
      .limit(limit)
      .exec();
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await this.productModel
      .find({ 
        isActive: true,
        rating: { $gte: 4.0 }
      })
      .populate('categoryId', 'name slug')
      .sort({ views: -1 })
      .limit(8)
      .exec();
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    return await this.productModel
      .find({
        isActive: true,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      })
      .populate('categoryId', 'name slug')
      .exec();
  }

  async incrementSales(id: string, quantity: number = 1): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    await this.productModel.findByIdAndUpdate(id, { $inc: { sales: quantity } });
  }
}