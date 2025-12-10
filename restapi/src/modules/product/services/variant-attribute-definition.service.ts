import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VariantAttributeDefinition, VariantAttributeDefinitionDocument } from '../schemas/variant-attribute-definition.schema';
import { 
  CreateVariantAttributeDefinitionDto, 
  UpdateVariantAttributeDefinitionDto,
  AddAttributeOptionDto,
  UpdateAttributeOptionDto
} from '../dto/variant-attribute-definition.dto';
import { VariantType } from '../schemas/product-variant.schema';

@Injectable()
export class VariantAttributeDefinitionService {
  constructor(
    @InjectModel(VariantAttributeDefinition.name)
    private attributeDefinitionModel: Model<VariantAttributeDefinitionDocument>,
  ) {}

  async create(createDto: CreateVariantAttributeDefinitionDto): Promise<VariantAttributeDefinition> {
    // Check if attribute with same name already exists
    const existing = await this.attributeDefinitionModel.findOne({ name: createDto.name });
    if (existing) {
      throw new BadRequestException('Attribute with this name already exists');
    }

    // Sort options by sortOrder
    createDto.options.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const attribute = new this.attributeDefinitionModel(createDto);
    return attribute.save();
  }

  async findAll(type?: VariantType, includeInactive = false): Promise<VariantAttributeDefinition[]> {
    const query: any = {};
    
    if (type) {
      query.type = type;
    }
    
    if (!includeInactive) {
      query.isActive = true;
    }

    return this.attributeDefinitionModel
      .find(query)
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  async findOne(id: string): Promise<VariantAttributeDefinition> {
    const attribute = await this.attributeDefinitionModel.findById(id).lean();
    
    if (!attribute) {
      throw new NotFoundException('Attribute definition not found');
    }

    return attribute;
  }

  async findByType(type: VariantType): Promise<VariantAttributeDefinition[]> {
    return this.attributeDefinitionModel
      .find({ type, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  async findByCategory(category: string): Promise<VariantAttributeDefinition[]> {
    return this.attributeDefinitionModel
      .find({ 
        applicableCategories: category,
        isActive: true 
      })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  async update(id: string, updateDto: UpdateVariantAttributeDefinitionDto): Promise<VariantAttributeDefinition> {
    // If name is being updated, check for uniqueness
    if (updateDto.name) {
      const existing = await this.attributeDefinitionModel.findOne({ 
        name: updateDto.name,
        _id: { $ne: id }
      });
      if (existing) {
        throw new BadRequestException('Attribute with this name already exists');
      }
    }

    // Sort options if provided
    if (updateDto.options) {
      updateDto.options.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    const updatedAttribute = await this.attributeDefinitionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .lean();

    if (!updatedAttribute) {
      throw new NotFoundException('Attribute definition not found');
    }

    return updatedAttribute;
  }

  async addOption(id: string, addOptionDto: AddAttributeOptionDto): Promise<VariantAttributeDefinition> {
    const attribute = await this.attributeDefinitionModel.findById(id);
    
    if (!attribute) {
      throw new NotFoundException('Attribute definition not found');
    }

    // Check if option value already exists
    const existingOption = attribute.options.find(opt => opt.value === addOptionDto.option.value);
    if (existingOption) {
      throw new BadRequestException('Option with this value already exists');
    }

    attribute.options.push({
      ...addOptionDto.option,
      isActive: addOptionDto.option.isActive !== undefined ? addOptionDto.option.isActive : true,
      sortOrder: addOptionDto.option.sortOrder || attribute.options.length
    });

    // Sort options
    attribute.options.sort((a, b) => a.sortOrder - b.sortOrder);

    await attribute.save();
    return attribute.toObject();
  }

  async updateOption(id: string, updateOptionDto: UpdateAttributeOptionDto): Promise<VariantAttributeDefinition> {
    const attribute = await this.attributeDefinitionModel.findById(id);
    
    if (!attribute) {
      throw new NotFoundException('Attribute definition not found');
    }

    const optionIndex = attribute.options.findIndex(opt => opt.value === updateOptionDto.optionValue);
    if (optionIndex === -1) {
      throw new NotFoundException('Option not found');
    }

    // If value is being updated, check for uniqueness
    if (updateOptionDto.updates.value && updateOptionDto.updates.value !== updateOptionDto.optionValue) {
      const existingOption = attribute.options.find(opt => opt.value === updateOptionDto.updates.value);
      if (existingOption) {
        throw new BadRequestException('Option with this value already exists');
      }
    }

    // Update the option
    Object.assign(attribute.options[optionIndex], updateOptionDto.updates);

    // Sort options if sortOrder was updated
    if (updateOptionDto.updates.sortOrder !== undefined) {
      attribute.options.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    await attribute.save();
    return attribute.toObject();
  }

  async removeOption(id: string, optionValue: string): Promise<VariantAttributeDefinition> {
    const attribute = await this.attributeDefinitionModel.findById(id);
    
    if (!attribute) {
      throw new NotFoundException('Attribute definition not found');
    }

    const optionIndex = attribute.options.findIndex(opt => opt.value === optionValue);
    if (optionIndex === -1) {
      throw new NotFoundException('Option not found');
    }

    attribute.options.splice(optionIndex, 1);
    await attribute.save();
    return attribute.toObject();
  }

  async delete(id: string): Promise<void> {
    const result = await this.attributeDefinitionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Attribute definition not found');
    }
  }

  async getAttributeTypes(): Promise<{ type: VariantType; label: string; description?: string }[]> {
    return [
      { type: VariantType.SIZE, label: 'Size', description: 'Product sizes (XS, S, M, L, XL, etc.)' },
      { type: VariantType.COLOR, label: 'Color', description: 'Product colors' },
      { type: VariantType.MATERIAL, label: 'Material', description: 'Product materials (Cotton, Silk, etc.)' },
      { type: VariantType.STYLE, label: 'Style', description: 'Product styles or designs' },
      { type: VariantType.WEIGHT, label: 'Weight', description: 'Product weight variations' },
      { type: VariantType.CAPACITY, label: 'Capacity', description: 'Storage or volume capacity' },
      { type: VariantType.CUSTOM, label: 'Custom', description: 'Custom attribute type' },
    ];
  }

  async seedDefaultAttributes(): Promise<void> {
    const defaultAttributes = [
      {
        name: 'Size',
        type: VariantType.SIZE,
        options: [
          { value: 'XS', displayValue: 'Extra Small', sortOrder: 1 },
          { value: 'S', displayValue: 'Small', sortOrder: 2 },
          { value: 'M', displayValue: 'Medium', sortOrder: 3 },
          { value: 'L', displayValue: 'Large', sortOrder: 4 },
          { value: 'XL', displayValue: 'Extra Large', sortOrder: 5 },
          { value: 'XXL', displayValue: 'Double Extra Large', sortOrder: 6 },
        ],
        isRequired: false,
        sortOrder: 1,
      },
      {
        name: 'Color',
        type: VariantType.COLOR,
        options: [
          { value: 'red', displayValue: 'Red', hexColor: '#FF0000', sortOrder: 1 },
          { value: 'blue', displayValue: 'Blue', hexColor: '#0000FF', sortOrder: 2 },
          { value: 'green', displayValue: 'Green', hexColor: '#008000', sortOrder: 3 },
          { value: 'black', displayValue: 'Black', hexColor: '#000000', sortOrder: 4 },
          { value: 'white', displayValue: 'White', hexColor: '#FFFFFF', sortOrder: 5 },
        ],
        isRequired: false,
        sortOrder: 2,
      },
      {
        name: 'Material',
        type: VariantType.MATERIAL,
        options: [
          { value: 'cotton', displayValue: 'Cotton', sortOrder: 1 },
          { value: 'silk', displayValue: 'Silk', sortOrder: 2 },
          { value: 'wool', displayValue: 'Wool', sortOrder: 3 },
          { value: 'polyester', displayValue: 'Polyester', sortOrder: 4 },
          { value: 'leather', displayValue: 'Leather', sortOrder: 5 },
        ],
        isRequired: false,
        sortOrder: 3,
      },
    ];

    for (const attr of defaultAttributes) {
      const existing = await this.attributeDefinitionModel.findOne({ name: attr.name });
      if (!existing) {
        await this.attributeDefinitionModel.create({
          ...attr,
          options: attr.options.map(opt => ({ ...opt, isActive: true }))
        });
      }
    }
  }
}
