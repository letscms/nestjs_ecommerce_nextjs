import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { CouponService } from '../services/coupon.service';
import { ApplyCouponDto } from '../dto/apply-coupon.dto';
import { Coupon } from '../schemas/coupon.schema';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCouponDto: Partial<Coupon>) {
    return this.couponService.create(createCouponDto);
  }

  @Post('apply')
  @HttpCode(HttpStatus.OK)
  applyCoupon(@Body() applyCouponDto: ApplyCouponDto) {
    return this.couponService.applyCoupon(applyCouponDto);
  }

  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  @Get('active')
  getActiveCoupons() {
    return this.couponService.getActiveCoupons();
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.couponService.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCouponDto: Partial<Coupon>
  ) {
    return this.couponService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }
}