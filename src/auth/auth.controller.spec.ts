import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignInResponse } from './dtos/sign-up.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    signin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUpByEmail', () => {
    it('should create a new user', async () => {
      const signUpDto: SignUpDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockSignUpResponse: SignInResponse = {
        accessToken: 'mockAccessToken',
        user: { id: 1, firstName: 'John', lastName: 'Doe', email: 'test@example.com' },
      };

      mockAuthService.signup.mockResolvedValue(mockSignUpResponse);

      const result = await controller.signUp({}, signUpDto);
      expect(result).toEqual(mockSignUpResponse);
      expect(mockAuthService.signup).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('signIn', () => {
    it('should authenticate a user', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockSignInResponse: SignInResponse = {
        accessToken: 'mockAccessToken',
        user: { id: 1, firstName: 'John', lastName: 'Doe', email: 'test@example.com' },
      };

      mockAuthService.signin.mockResolvedValue(mockSignInResponse);

      const result = await controller.signIn({}, signInDto);
      expect(result).toEqual(mockSignInResponse);
      expect(mockAuthService.signin).toHaveBeenCalledWith(signInDto);
    });
  });
});
