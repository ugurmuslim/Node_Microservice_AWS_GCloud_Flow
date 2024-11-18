import { IsCreditCard, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CardMessage } from '@app/common/types';

export class CardDto implements CardMessage{
  @IsString()
  @IsNotEmpty()
  cvc: string;

  @IsNumber()
  @IsNotEmpty()
  expMonth: number;

  @IsNumber()
  @IsNotEmpty()
  expYear: number;

  @IsCreditCard()
  @IsNotEmpty()
  number: string;

}