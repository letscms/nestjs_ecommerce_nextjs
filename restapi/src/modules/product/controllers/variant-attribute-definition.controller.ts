import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { VariantAttributeDefinitionService } from '../services/variant-attribute-definition.service';
import { 
  CreateVariantAttributeDefinitionDto, 
  UpdateVariantAttributeDefinitionDto,
  AddAttributeOptionDto,
  UpdateAttributeOptionDto
} from '../dto/variant-attribute-definition.dto';
import { ResponseService } from '../../../i18n/services/response.service';
import { I18nLang } from 'nestjs-i18n';
import { VariantType } from '../schemas/product-variant.schema';

@ApiTags('variant-attributes')
@Controller('variant-attributes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class VariantAttributeDefinitionController {
  constructor(
    private readonly attributeService: VariantAttributeDefinitionService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new variant attribute definition' })
  async create(
    @Body() createDto: CreateVariantAttributeDefinitionDto,
    @I18nLang() lang: string = 'en',
  ) {
    const attribute = await this.attributeService.create(createDto);
    return this.responseService.success(
      attribute,
      'products.attribute_created',
      lang
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all variant attribute definitions' })
  @ApiQuery({ name: 'type', required: false, enum: VariantType })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  async findAll(
    @Query('type') type?: VariantType,
    @Query('includeInactive') includeInactive: string = 'false',
    @I18nLang() lang: string = 'en',
  ) {
    const attributes = await this.attributeService.findAll(
      type,
      includeInactive === 'true'
    );
    
    return this.responseService.success(
      attributes,
      'common.success',
      lang
    );
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all available attribute types' })
  async getAttributeTypes(
    @I18nLang() lang: string = 'en',
  ) {
    const types = await this.attributeService.getAttributeTypes();
    
    return this.responseService.success(
      types,
      'common.success',
      lang
    );
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get attribute definitions by type' })
  async findByType(
    @Param('type') type: VariantType,
    @I18nLang() lang: string = 'en',
  ) {
    const attributes = await this.attributeService.findByType(type);
    
    return this.responseService.success(
      attributes,
      'common.success',
      lang
    );
  }

  @Get('by-category/:category')
  @ApiOperation({ summary: 'Get attribute definitions by category' })
  async findByCategory(
    @Param('category') category: string,
    @I18nLang() lang: string = 'en',
  ) {
    const attributes = await this.attributeService.findByCategory(category);
    
    return this.responseService.success(
      attributes,
      'common.success',
      lang
    );
  }

  @Post('seed-defaults')
  @ApiOperation({ summary: 'Seed default attribute definitions' })
  async seedDefaults(
    @I18nLang() lang: string = 'en',
  ) {
    await this.attributeService.seedDefaultAttributes();
    
    return this.responseService.success(
      null,
      'products.default_attributes_seeded',
      lang
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attribute definition by ID' })
  async findOne(
    @Param('id') id: string,
    @I18nLang() lang: string = 'en',
  ) {
    const attribute = await this.attributeService.findOne(id);
    
    return this.responseService.success(
      attribute,
      'common.success',
      lang
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attribute definition' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateVariantAttributeDefinitionDto,
    @I18nLang() lang: string = 'en',
  ) {
    const attribute = await this.attributeService.update(id, updateDto);
    
    return this.responseService.success(
      attribute,
      'products.attribute_updated',
      lang
    );
  }

  @Post(':id/options')
  @ApiOperation({ summary: 'Add option to attribute definition' })
  async addOption(
    @Param('id') id: string,
    @Body() addOptionDto: AddAttributeOptionDto,
    @I18nLang() lang: string = 'en',
  ) {
    const attribute = await this.attributeService.addOption(id, addOptionDto);
    
    return this.responseService.success(
      attribute,
      'products.attribute_option_added',
      lang
    );
  }

  @Patch(':id/options')
  @ApiOperation({ summary: 'Update option in attribute definition' })
  async updateOption(
    @Param('id') id: string,
    @Body() updateOptionDto: UpdateAttributeOptionDto,
    @I18nLang() lang: string = 'en',
  ) {
    const attribute = await this.attributeService.updateOption(id, updateOptionDto);
    
    return this.responseService.success(
      attribute,
      'products.attribute_option_updated',
      lang
    );
  }

  @Delete(':id/options/:optionValue')
  @ApiOperation({ summary: 'Remove option from attribute definition' })
  async removeOption(
    @Param('id') id: string,
    @Param('optionValue') optionValue: string,
    @I18nLang() lang: string = 'en',
  ) {
    const attribute = await this.attributeService.removeOption(id, optionValue);
    
    return this.responseService.success(
      attribute,
      'products.attribute_option_removed',
      lang
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attribute definition' })
  async remove(
    @Param('id') id: string,
    @I18nLang() lang: string = 'en',
  ) {
    await this.attributeService.delete(id);
    
    return this.responseService.success(
      null,
      'products.attribute_deleted',
      lang
    );
  }
}
