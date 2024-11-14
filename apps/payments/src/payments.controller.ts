import { Controller, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateChargeDto } from '@app/common/dto/create-charge.dto';
import { PaymentsCreateChargeDto } from '../dto/payments-create-charge.dto';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern('createCharge')
  @UsePipes(new ValidationPipe())
  async createCharge(@Payload() data: PaymentsCreateChargeDto, @Ctx() context : RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage =  context.getMessage();

    channel.ack(originalMessage);
    return this.paymentsService.createCharge(data);

  }
}
