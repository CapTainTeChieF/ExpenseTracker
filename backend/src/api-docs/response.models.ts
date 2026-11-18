import { ApiProperty } from '@nestjs/swagger';
import { TransactionKind } from '../transactions/transaction.dto';

export class CategoryView {
  @ApiProperty({format:'uuid'}) id!: string;
  @ApiProperty({example:'Food'}) name!: string;
  @ApiProperty({enum:TransactionKind}) kind!: TransactionKind;
}
export class TransactionView {
  @ApiProperty({format:'uuid'}) id!: string;
  @ApiProperty({enum:TransactionKind}) kind!: TransactionKind;
  @ApiProperty({example:'350.00',type:String}) amount!: string;
  @ApiProperty({example:'BDT'}) currency!: string;
  @ApiProperty({example:'2026-11-09'}) transactionDate!: string;
  @ApiProperty({example:'Lunch'}) description!: string;
  @ApiProperty({nullable:true,format:'uuid',type:String}) categoryId!: string | null;
  @ApiProperty({nullable:true,type:String}) categoryName!: string | null;
}
export class SummaryView {
  @ApiProperty({example:'BDT'}) currency!: string;
  @ApiProperty({example:'1500.00',type:String}) income!: string;
  @ApiProperty({example:'350.00',type:String}) expense!: string;
  @ApiProperty({example:'1150.00',type:String}) balance!: string;
  @ApiProperty({example:2}) transactionCount!: number;
}
export class BreakdownRowView {
  @ApiProperty({enum:TransactionKind}) kind!: TransactionKind;
  @ApiProperty({example:'Food'}) name!: string;
  @ApiProperty({example:'250.00',type:String}) total!: string;
  @ApiProperty({example:1}) count!: number;
}
export class MonthlyView extends SummaryView {
  @ApiProperty({example:'2026-11'}) month!: string;
  @ApiProperty({type:[BreakdownRowView]}) categories!: BreakdownRowView[];
}
export class TrendRowView {
  @ApiProperty({example:'2026-11'}) month!: string;
  @ApiProperty({example:'1000.00',type:String}) income!: string;
  @ApiProperty({example:'250.00',type:String}) expense!: string;
}
export class TrendView {
  @ApiProperty({example:'BDT'}) currency!: string;
  @ApiProperty({example:'2026-11'}) endMonth!: string;
  @ApiProperty({type:[TrendRowView]}) months!: TrendRowView[];
}
