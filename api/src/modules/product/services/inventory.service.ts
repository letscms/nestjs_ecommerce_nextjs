import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inventory, InventoryDocument, InventoryType } from '../schemas/inventory.schema';
import { ProductService } from './product.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    private productService: ProductService,
  ) {}

  async addStock(productId: string, quantity: number, reason?: string, reference?: string): Promise<void> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const inventory = new this.inventoryModel({
      productId: new Types.ObjectId(productId),
      type: InventoryType.IN,
      quantity,
      reason,
      reference
    });

    await inventory.save();
    await this.productService.updateStock(productId, quantity);
  }

  async removeStock(productId: string, quantity: number, reason?: string, reference?: string): Promise<void> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productService.findOne(productId);
    
    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const inventory = new this.inventoryModel({
      productId: new Types.ObjectId(productId),
      type: InventoryType.OUT,
      quantity: -quantity,
      reason,
      reference
    });

    await inventory.save();
    await this.productService.updateStock(productId, -quantity);
  }

  async adjustStock(productId: string, newQuantity: number, reason?: string): Promise<void> {
    if (newQuantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productService.findOne(productId);
    const difference = newQuantity - product.stock;

    if (difference !== 0) {
      const inventory = new this.inventoryModel({
        productId: new Types.ObjectId(productId),
        type: InventoryType.ADJUSTMENT,
        quantity: difference,
        reason
      });

      await inventory.save();
      await this.productService.updateStock(productId, difference);
    }
  }

  async getInventoryHistory(productId: string, limit: number = 50): Promise<Inventory[]> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    return await this.inventoryModel
      .find({ productId: new Types.ObjectId(productId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getInventoryReport(startDate?: Date, endDate?: Date): Promise<any> {
    const matchStage: any = {};

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    return await this.inventoryModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$productId',
          productName: { $first: '$product.name' },
          productSku: { $first: '$product.sku' },
          totalIn: {
            $sum: {
              $cond: [{ $eq: ['$type', InventoryType.IN] }, '$quantity', 0]
            }
          },
          totalOut: {
            $sum: {
              $cond: [{ $eq: ['$type', InventoryType.OUT] }, { $abs: '$quantity' }, 0]
            }
          },
          totalAdjustment: {
            $sum: {
              $cond: [{ $eq: ['$type', InventoryType.ADJUSTMENT] }, '$quantity', 0]
            }
          }
        }
      }
    ]);
  }

  async getLowStockAlert(): Promise<any[]> {
    return await this.productService.getLowStockProducts();
  }
}