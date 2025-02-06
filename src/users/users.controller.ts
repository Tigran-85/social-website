import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SearchUsersDto } from './dtos/search-user.dto';
import { UsersService } from './users.service';
import { User } from './entities/users.entity';
import { AuthGuard } from '../common/guards/jwt.authGuard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  async searchUsers(@Query() filters: SearchUsersDto): Promise<User[]> {
    return this.usersService.searchUsers(filters);
  }

  @UseGuards(AuthGuard)
  @Post('send-request/:receiverId')
  async sendFriendRequest(
    @Request() req,
    @Param('receiverId', ParseIntPipe) receiverId: number,
  ) {
    const userId = req.user.userId;
    return this.usersService.sendFriendRequest(userId, receiverId);
  }

  @UseGuards(AuthGuard)
  @Get('friend-requests')
  async getFriendRequests(@Request() req) {
    const userId = req.user.userId;
    return this.usersService.getFriendRequests(userId);
  }

  @UseGuards(AuthGuard)
  @Post('accept-request/:senderId')
  async acceptFriendRequest(
    @Request() req,
    @Param('senderId') senderId: number,
  ) {
    const userId = req.user.userId;
    return this.usersService.acceptFriendRequest(userId, senderId);
  }

  @UseGuards(AuthGuard)
  @Post('decline-request/:senderId')
  async declineFriendRequest(@Request() req, @Param('senderId') senderId: number) {
    const userId = req.user.userId;
    return this.usersService.declineFriendRequest(userId, senderId);
  }

  @UseGuards(AuthGuard)
  @Get('friends')
  async getFriends(@Request() req) {
    const userId = req.user.userId;
    return this.usersService.getFriends(userId);
  }
}
