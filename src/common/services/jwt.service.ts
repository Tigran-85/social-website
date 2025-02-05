import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../interfaces/jwt.interface';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JWTService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async comparePasswords(password: string, userPassword: string) {
    return await bcrypt.compare(password, userPassword);
  }
  async encodePassword(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async generateJwt(credentialKey: string): Promise<string> {
    const payload: JwtPayload  = { credentialKey };

    return this.jwtService.sign(payload);
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const userEmail = username.toLowerCase();

    const user = await this.usersService.findByEmail(userEmail);
    try {
      const comparePass = await this.comparePasswords(pass, user.password);

      if (user && comparePass) {
        return user;
      }
    } catch (e) {
      return null;
    }
  }
}