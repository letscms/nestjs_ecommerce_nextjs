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
import { ProductVariantService } from '../services/product-variant.service';
import { 
  CreateProductVariantDto, 
  UpdateProductVariantDto, 
  BulkUpdateVariantsDto,
  VariantFilterDto 
} from '../dto/product-variant.dto';
import { ResponseService } from '../../../i18n/services/response.service';
import { I18nLang } from 'nestjs-i18n';

@ApiTags('product-variants')
@Controller('product-variants')
export class ProductVariantController {
  constructor(
    private readonly variantService: ProductVariantService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product variant' })
  async create(
    @Body() createVariantDto: CreateProductVariantDto,
    @I18nLang() lang: string = 'en',
  ) {
    const variant = await this.variantService.create(createVariantDto);
    return this.responseService.success(
      variant,
      'products.variant_created',
      lang
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all product variants with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'inStock', required: false, type: Boolean })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  async findAll(
    @Query() filters: VariantFilterDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @I18nLang() lang: string = 'en',
  ) {
    const result = await this.variantService.findAll(
      filters,
      +page,
      +limit
    );
    
    return this.responseService.success(
      result.variants,
      'common.success',
      lang,
      {
        page: +page,
        limit: +limit,
        total: result.total,
        totalPages: result.totalPages,
      }
    );
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all variants for a specific product' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  async findByProduct(
    @Param('productId') productId: string,
    @Query('includeInactive') includeInactive: string = 'false',
    @I18nLang() lang: string = 'en',
  ) {
    const variants = await this.variantService.findByProductId(
      productId,
      includeInactive === 'true'
    );
    
    return this.responseService.success(
      variants,
      'common.success',
      lang
    );
  }

  @Get('product/:productId/combinations')
  @ApiOperation({ summary: 'Get all variant combinations for a product' })
  async getVariantCombinations(
    @Param('productId') productId: string,
    @I18nLang() lang: string = 'en',
  ) {
    const combinations = await this.variantService.getVariantCombinations(productId);
    
    return this.responseService.success(
      combinations,
      'common.success',
      lang
    );
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Get variant by SKU' })
  async findBySku(
    @Param('sku') sku: string,
    @I18nLang() lang: string = 'en',
  ) {
    const variant = await this.variantService.findBySku(sku);
    
    return this.responseService.success(
      variant,
      'common.success',
      lang
    );
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get low stock variants' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  async getLowStockVariants(
    @Query('threshold') threshold?: string,
    @I18nLang() lang: string = 'en',
  ) {
    const variants = await this.variantService.getLowStockVariants(
      threshold ? +threshold : undefined
    );
    
    return this.responseService.success(
      variants,
      'common.success',
      lang
    );
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get variant analytics' })
  @ApiQuery({ name: 'productId', required: false, type: String })
  async getAnalytics(
    @Query('productId') productId?: string,
    @I18nLang() lang: string = 'en',
  ) {
    const analytics = await this.variantService.getVariantAnalytics(productId);
    
    return this.responseService.success(
      analytics,
      'common.success',
      lang
    );
  }

  @Post('filter-by-attributes/:productId')
  @ApiOperation({ summary: 'Filter variants by attributes' })
  async filterByAttributes(
    @Param('productId') productId: string,
    @Body() attributeFilters: { [attributeType: string]: string[] },
    @I18nLang() lang: string = 'en',
  ) {
    const variants = await this.variantService.findByAttributes(
      productId,
      attributeFilters
    );
    
    return this.responseService.success(
      variants,
      'common.success',
      lang
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get variant by ID' })
  async findOne(
    @Param('id') id: string,
    @I18nLang() lang: string = 'en',
  ) {
    const variant = await this.variantService.findOne(id);
    
    return this.responseService.success(
      variant,
      'common.success',
      lang
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product variant' })
  async update(
    @Param('id') id: string,
    @Body() updateVariantDto: UpdateProductVariantDto,
    @I18nLang() lang: string = 'en',
  ) {
    const variant = await this.variantService.update(id, updateVariantDto);
    
    return this.responseService.success(
      variant,
      'products.variant_updated',
      lang
    );
  }

  @Patch('bulk-update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update variants' })
  async bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateVariantsDto,
    @I18nLang() lang: string = 'en',
  ) {
    const result = await this.variantService.bulkUpdate(bulkUpdateDto);
    
    return this.responseService.success(
      result,
      'products.variants_updated',
      lang
    );
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update variant stock' })
  async updateStock(
    @Param('id') id: string,
    @Body('stock') stock: number,
    @I18nLang() lang: string = 'en',
  ) {
    const variant = await this.variantService.updateStock(id, stock);
    
    return this.responseService.success(
      variant,
      'products.stock_updated',
      lang
    );
  }

  @Post(':id/increment-sales')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Increment variant sales count' })
  async incrementSales(
    @Param('id') id: string,
    @Body('quantity') quantity: number = 1,
    @I18nLang() lang: string = 'en',
  ) {
    const variant = await this.variantService.incrementSales(id, quantity);
    
    return this.responseService.success(
      variant,
      'products.sales_incremented',
      lang
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product variant' })
  async remove(
    @Param('id') id: string,
    @I18nLang() lang: string = 'en',
  ) {
    await this.variantService.delete(id);
    
    return this.responseService.success(
      null,
      'products.variant_deleted',
      lang
    );
  }
}
