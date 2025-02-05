import { Controller, Post, Request, Body, UseInterceptors } from '@nestjs/common';
import { SignInResponse, SignUpDto, SignUpResponse } from './dtos/sign-up.dto';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/sign-in.dto';

@Controller('auth')
@UseInterceptors(TransformInterceptor)
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/signUp')
    signUp(
        @Request() req,
        @Body() signUpDto: SignUpDto): Promise<SignUpResponse> {
        return this.authService.signup(signUpDto);
    }
    
    @Post('/signIn')
    signIn(
      @Request() req,
      @Body() signInDto: SignInDto,
    ): Promise<SignInResponse> {
      return this.authService.signin(signInDto);
    }
}
