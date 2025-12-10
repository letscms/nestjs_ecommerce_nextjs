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
  ParseUUIDPipe,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductQueryDto } from '../dto/product-query.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Get('search')
  search(@Query('q') searchTerm: string) {
    return this.productService.searchProducts(searchTerm);
  }

  @Get('featured')
  getFeatured() {
    return this.productService.getFeaturedProducts();
  }

  @Get('low-stock')
  getLowStock(@Query('threshold') threshold?: number) {
    return this.productService.getLowStockProducts(threshold);
  }

  @Get('top-selling')
  getTopSelling(@Query('limit') limit: number = 10) {
    return this.productService.getTopSellingProducts(limit);
  }

  @Get('sku/:sku')
  findBySku(@Param('sku') sku: string) {
    return this.productService.findBySku(sku);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  @Patch(':id/stock')
  updateStock(
    @Param('id') id: string, 
    @Body('quantity') quantity: number
  ) {
    return this.productService.updateStock(id, quantity);
  }

  @Post(':id/increment-sales')
  incrementSales(
    @Param('id') id: string,
    @Body('quantity') quantity: number = 1
  ) {
    return this.productService.incrementSales(id, quantity);
  }
}