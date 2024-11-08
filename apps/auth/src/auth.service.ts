import { Injectable } from '@nestjs/common';
import { UsersDocument } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from './interfaces/token-payload.interface';
@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService, private readonly jwtService: JwtService) {
  }

  async login(user: UsersDocument, response: Response) {
    const payload: TokenPayload = {
      userId: user._id.toHexString()
    };

    const expires = new Date()
    const expiresIn = this.configService.get('JWT_EXPIRES_IN');

    expires.setSeconds(expires.getSeconds() + expiresIn);
    const token = this.jwtService.sign(payload);
    response.cookie('Authentication', token, { httpOnly: true, expires: expires });
  }
}
