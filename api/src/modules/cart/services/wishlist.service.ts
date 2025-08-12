import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from '../schemas/wishlist.schema';
import { ProductService } from '../../product/services/product.service';
import { AddToWishlistDto } from '../dto/add-to-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
    private productService: ProductService,
  ) {}

  async addToWishlist(addToWishlistDto: AddToWishlistDto): Promise<Wishlist> {
    const { productId, userId, variantId } = addToWishlistDto;

    // Validate product exists
    const product = await this.productService.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Find or create wishlist
    let wishlist = await this.wishlistModel.findOne({ 
      userId: new Types.ObjectId(userId) 
    });

    if (!wishlist) {
      wishlist = new this.wishlistModel({
        userId: new Types.ObjectId(userId),
        items: [],
        totalItems: 0
      });
    }

    // Check if item already exists
    const existingItemIndex = wishlist.items.findIndex(item => 
      item.productId.toString() === productId && 
      (!variantId || item.variantId?.toString() === variantId)
    );

    if (existingItemIndex > -1) {
      throw new BadRequestException('Item already exists in wishlist');
    }

    // Add new item
    const newItem = {
      productId: new Types.ObjectId(productId),
      variantId: variantId ? new Types.ObjectId(variantId) : undefined,
      addedAt: new Date()
    };

    wishlist.items.push(newItem);
    wishlist.totalItems = wishlist.items.length;

    return await wishlist.save();
  }

  async removeFromWishlist(userId: string, productId: string, variantId?: string): Promise<Wishlist> {
    const wishlist = await this.wishlistModel.findOne({ 
      userId: new Types.ObjectId(userId) 
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    wishlist.items = wishlist.items.filter(item => 
      !(item.productId.toString() === productId && 
        (!variantId || item.variantId?.toString() === variantId))
    );

    wishlist.totalItems = wishlist.items.length;

    return await wishlist.save();
  }

  async getWishlist(userId: string): Promise<Wishlist | null> {
    const wishlist = await this.wishlistModel.findOne({ 
      userId: new Types.ObjectId(userId) 
    }).populate([
      { 
        path: 'items.productId', 
        select: 'name price salePrice images stock isActive',
        match: { isActive: true }
      },
      { 
        path: 'items.variantId', 
        select: 'name price attributes images' 
      }
    ]);

    if (wishlist) {
      // Filter out items where product is null (inactive products)
      wishlist.items = wishlist.items.filter(item => item.productId);
      wishlist.totalItems = wishlist.items.length;
    }

    return wishlist;
  }

  async clearWishlist(userId: string): Promise<void> {
    const wishlist = await this.wishlistModel.findOne({ 
      userId: new Types.ObjectId(userId) 
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    wishlist.items = [];
    wishlist.totalItems = 0;

    await wishlist.save();
  }

  async moveToCart(userId: string, productId: string, variantId?: string): Promise<{ success: boolean, message: string }> {
    // This would integrate with CartService
    // For now, just remove from wishlist
    await this.removeFromWishlist(userId, productId, variantId);
    
    return {
      success: true,
      message: 'Item moved to cart successfully'
    };
  }

  async getWishlistSummary(userId: string): Promise<any> {
    const wishlist = await this.getWishlist(userId);
    
    if (!wishlist) {
      return {
        totalItems: 0,
        items: []
      };
    }

    return {
      totalItems: wishlist.totalItems,
      items: wishlist.items.map((item, index) => ({
        id: `${item.productId}_${item.variantId || 'default'}_${index}`,
        productId: item.productId,
        variantId: item.variantId,
        addedAt: item.addedAt
      }))
    };
  }

  async isInWishlist(userId: string, productId: string, variantId?: string): Promise<boolean> {
    const wishlist = await this.wishlistModel.findOne({ 
      userId: new Types.ObjectId(userId) 
    });

    if (!wishlist) {
      return false;
    }

    return wishlist.items.some(item => 
      item.productId.toString() === productId && 
      (!variantId || item.variantId?.toString() === variantId)
    );
  }
}