import {
  ConflictException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { SignInResponse, SignUpDto, SignUpResponse } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { ERROR_MESSAGES } from '../common/constants/responseMessages.constant';
import { JWTService } from '../common/services/jwt.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JWTService,
    private usersService: UsersService,
  ) {}

  async signup(signUpDto: SignUpDto): Promise<SignUpResponse> {
    const userExists = await this.userRepository.findOne({
      where: { email: signUpDto.email },
    });

    if (userExists) {
      throw new ConflictException(ERROR_MESSAGES.USER_EMAIL_EXISTS);
    }

    const user = this.userRepository.create(signUpDto);
    await this.userRepository.save(user);

    const jwt = await this.jwtService.generateJwt(
      user.id,
    );
    delete user.password;

    return { user, accessToken: jwt };
  }

  async signin(signInDto: SignInDto): Promise<SignInResponse> {
    const user = await this.userRepository.findOne({
      where: { email: signInDto.email },
    });

    if (!user) {
      throw new ConflictException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const compareSuccess = await this.jwtService.comparePasswords(
      signInDto.password,
      user.password,
    );

    if (!compareSuccess) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const jwt = await this.jwtService.generateJwt(
      user.id,
    );

    return { user, accessToken: jwt };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (user && (await user.validatePassword(pass))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
