import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { CreateCategoryDto } from '../dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = this.generateSlug(createCategoryDto.name);
    
    // Check if slug already exists
    const existingCategory = await this.categoryModel.findOne({ slug });

    if (existingCategory) {
      throw new BadRequestException('Category with this name already exists');
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      slug
    });

    return await category.save();
  }

  async findAll(includeInactive: boolean = false): Promise<Category[]> {
    const filter: any = {};
    
    if (!includeInactive) {
      filter.isActive = true;
    }

    return await this.categoryModel
      .find(filter)
      .populate('parentId', 'name slug')
      .sort({ sortOrder: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const category = await this.categoryModel
      .findById(id)
      .populate('parentId', 'name slug')
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel
      .findOne({ slug })
      .populate('parentId', 'name slug')
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: any): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    if (updateCategoryDto.name) {
      const slug = this.generateSlug(updateCategoryDto.name);
      const existingCategory = await this.categoryModel.findOne({
        slug,
        _id: { $ne: id }
      });

      if (existingCategory) {
        throw new BadRequestException('Category with this name already exists');
      }

      updateCategoryDto.slug = slug;
    }

    const category = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .populate('parentId', 'name slug')
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    // Check if category has subcategories
    const hasChildren = await this.categoryModel.findOne({ parentId: new Types.ObjectId(id) });
    if (hasChildren) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Category not found');
    }
  }

  async getHierarchy(): Promise<Category[]> {
    return await this.categoryModel
      .find({ parentId: null, isActive: true })
      .sort({ sortOrder: 1 })
      .exec();
  }

  async getParentCategories(): Promise<Category[]> {
    return await this.categoryModel
      .find({ parentId: null })
      .sort({ sortOrder: 1 })
      .exec();
  }

  async getSubCategories(parentId: string): Promise<Category[]> {
    if (!Types.ObjectId.isValid(parentId)) {
      throw new BadRequestException('Invalid parent category ID');
    }

    return await this.categoryModel
      .find({ parentId: new Types.ObjectId(parentId) })
      .sort({ sortOrder: 1 })
      .exec();
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}