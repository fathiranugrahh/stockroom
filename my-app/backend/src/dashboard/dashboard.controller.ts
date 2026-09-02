import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';
import { LimitQueryDto, StockTrendQueryDto } from './dto/dashboard-query.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary() {
    return this.dashboardService.summary();
  }

  @Get('low-stock-products')
  lowStockProducts(@Query() query: LimitQueryDto) {
    return this.dashboardService.lowStockProducts(query.limit);
  }

  @Get('stock-trend')
  stockTrend(@Query() query: StockTrendQueryDto) {
    return this.dashboardService.stockTrend(query.days);
  }

  @Get('top-stock-value')
  topStockValue(@Query() query: LimitQueryDto) {
    return this.dashboardService.topStockValue(query.limit);
  }
}
