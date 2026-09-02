import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { QueryStockMovementDto } from './dto/query-stock-movement.dto';
import { StockMovementsService } from './stock-movements.service';

@ApiTags('stock-movements')
@ApiBearerAuth()
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post('in')
  stockIn(
    @Body() dto: CreateStockMovementDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.stockMovementsService.stockIn(dto, actorId);
  }

  @Post('out')
  stockOut(
    @Body() dto: CreateStockMovementDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.stockMovementsService.stockOut(dto, actorId);
  }

  @Get()
  findAll(@Query() query: QueryStockMovementDto) {
    return this.stockMovementsService.findAll(query);
  }
}
