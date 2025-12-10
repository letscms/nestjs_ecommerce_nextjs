import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('add-stock')
  @HttpCode(HttpStatus.OK)
  addStock(@Body() body: { 
    productId: string; 
    quantity: number; 
    reason?: string;
    reference?: string;
  }) {
    return this.inventoryService.addStock(
      body.productId, 
      body.quantity, 
      body.reason,
      body.reference
    );
  }

  @Post('remove-stock')
  @HttpCode(HttpStatus.OK)
  removeStock(@Body() body: { 
    productId: string; 
    quantity: number; 
    reason?: string;
    reference?: string;
  }) {
    return this.inventoryService.removeStock(
      body.productId, 
      body.quantity, 
      body.reason,
      body.reference
    );
  }

  @Post('adjust-stock')
  @HttpCode(HttpStatus.OK)
  adjustStock(@Body() body: { 
    productId: string; 
    newQuantity: number; 
    reason?: string;
  }) {
    return this.inventoryService.adjustStock(
      body.productId, 
      body.newQuantity, 
      body.reason
    );
  }

  @Get(':productId/history')
  getHistory(
    @Param('productId') productId: string,
    @Query('limit') limit: number = 50
  ) {
    return this.inventoryService.getInventoryHistory(productId, limit);
  }

  @Get('report')
  getReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.inventoryService.getInventoryReport(start, end);
  }

  @Get('low-stock-alert')
  getLowStockAlert() {
    return this.inventoryService.getLowStockAlert();
  }
}