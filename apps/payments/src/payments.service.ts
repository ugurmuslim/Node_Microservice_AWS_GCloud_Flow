import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { NOTIFICATIONS_SERVICE, NOTIFICATIONS_SERVICE_NAME, NotificationsServiceClient } from '@app/common';
import { PaymentsCreateChargeDto } from '../dto/payments-create-charge.dto';

@Injectable()
export class PaymentsService {
  private notificationService: NotificationsServiceClient
  constructor(
    private readonly configService: ConfigService,
    @Inject(NOTIFICATIONS_SERVICE_NAME)
    private readonly client: ClientGrpc,
  ) {}


  private readonly stripe = new Stripe(
    this.configService.get('STRIPE_SECRET_KEY'),
    { apiVersion: '2024-10-28.acacia' },
  );

  async createCharge({ card, amount, email }: PaymentsCreateChargeDto) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      payment_method: 'pm_card_visa',
      confirm: false,
    });

    if(!this.notificationService) {
      this.notificationService = this.client.getService<NotificationsServiceClient>(NOTIFICATIONS_SERVICE_NAME);
    }

    this.notificationService.notifyEmail({ email }).subscribe(() => {})

    return paymentIntent;
  }
}
