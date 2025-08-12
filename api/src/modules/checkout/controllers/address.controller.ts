import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { CreateAddressDto } from '../dto/create-address.dto';

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(createAddressDto);
  }

  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string) {
    return this.addressService.findAllByUser(userId);
  }

  @Get('user/:userId/default')
  getDefaultAddress(@Param('userId') userId: string) {
    return this.addressService.getDefaultAddress(userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('userId') userId: string
  ) {
    return this.addressService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateAddressDto: Partial<CreateAddressDto>
  ) {
    return this.addressService.update(id, userId, updateAddressDto);
  }

  @Patch(':id/set-default')
  setDefault(
    @Param('id') id: string,
    @Query('userId') userId: string
  ) {
    return this.addressService.setDefault(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @Query('userId') userId: string
  ) {
    return this.addressService.remove(id, userId);
  }
}