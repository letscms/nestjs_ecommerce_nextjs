import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Query,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query('includeInactive') includeInactive: boolean = false) {
    return this.categoryService.findAll(includeInactive);
  }

  @Get('hierarchy')
  getHierarchy() {
    return this.categoryService.getHierarchy();
  }

  @Get('parents')
  getParents() {
    return this.categoryService.getParentCategories();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Get(':id/subcategories')
  getSubCategories(@Param('id') id: string) {
    return this.categoryService.getSubCategories(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateCategoryDto: any
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}