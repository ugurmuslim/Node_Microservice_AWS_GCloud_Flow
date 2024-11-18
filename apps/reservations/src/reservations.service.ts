import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';
import { ClientGrpc } from '@nestjs/microservices';
import {  PAYMENTS_SERVICE_NAME, PaymentsServiceClient, UserDto } from '@app/common';
import { catchError, map } from 'rxjs';
import { getLogger } from '@grpc/grpc-js/build/src/logging';

@Injectable()
export class ReservationsService implements OnModuleInit {
  private paymentService: PaymentsServiceClient;
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    @Inject(PAYMENTS_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentService = this.client.getService<PaymentsServiceClient>(PAYMENTS_SERVICE_NAME)
  }

  async create(
    createReservationDto: CreateReservationDto,
    { email, _id }: UserDto,
  ) {

    console.log('createReservationDto', { ...createReservationDto.charge, email });
    return this.paymentService.createCharge({ ...createReservationDto.charge, email })
      .pipe(
        map((response) => {
          return this.reservationsRepository.create({
            ...createReservationDto,
            invoiceId: response.id,
            timestamp: new Date(),
            userId: _id,
          });
        }),
        catchError((error) => {
          getLogger().error(error);
          throw new Error('Failed to create reservation');
        })
      );
  }

  async findAll() {
    return this.reservationsRepository.find({});
  }

  async findOne(id: string) {
    return this.reservationsRepository.findOne({ _id: id });
  }

  async update(id: number, updateReservationDto: UpdateReservationDto) {
    this.reservationsRepository.findOneAndUpdate(
      { _id: id },
      { $set: updateReservationDto },
    );
  }

  async remove(id: string) {
    return this.reservationsRepository.findOneAndDelete({ _id: id });
  }
}
