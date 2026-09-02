import { IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class QueryStockMovementDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  productId?: string;
}
