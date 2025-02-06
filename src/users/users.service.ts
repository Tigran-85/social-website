import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { SearchUsersDto } from './dtos/search-user.dto';
import {
  ERROR_MESSAGES,
  RESPONSE_MESSAGES,
} from '../common/constants/responseMessages.constant';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async searchUsers(filters: SearchUsersDto): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (key === 'firstName' || key === 'lastName') {
          query.andWhere(`user.${key} ILIKE :${key}`, { [key]: `%${value}%` });
        } else {
          query.andWhere(`user.${key} = :${key}`, { [key]: value });
        }
      }
    });

    return query.getMany();
  }

  async sendFriendRequest(senderId: number, receiverId: number) {
    if (senderId === receiverId) {
      throw new BadRequestException(ERROR_MESSAGES.CANNOT_ADD_YOURSELF);
    }

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
      relations: ['sentRequests'],
    });
    const receiver = await this.userRepository.findOne({
      where: { id: receiverId },
      relations: ['receivedRequests'],
    });

    if (!sender || !receiver)
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);

    if (sender.sentRequests.some((user) => user.id === receiverId)) {
      throw new BadRequestException(ERROR_MESSAGES.REQUEST_ALREADY_SENT);
    }

    sender.sentRequests.push(receiver);
    receiver.receivedRequests.push(sender);

    await this.userRepository.save(sender);
    await this.userRepository.save(receiver);

    return { message: RESPONSE_MESSAGES.FRIEND_REQUEST_SENT };
  }

  async getFriendRequests(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['receivedRequests'],
    });
    if (!user) throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);

    return user.receivedRequests;
  }

  async acceptFriendRequest(userId: number, senderId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['receivedRequests', 'friends'],
    });
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
      relations: ['sentRequests', 'friends'],
    });

    if (!user || !sender) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (sender.sentRequests.length === 0) {
      throw new NotFoundException(ERROR_MESSAGES.REQUEST_NOT_FOUND);
    }

    // Add to friends list
    user.friends.push(sender);
    sender.friends.push(user);

    // Remove request from pending lists
    user.receivedRequests = user.receivedRequests.filter(
      (req) => req.id !== senderId,
    );
    sender.sentRequests = sender.sentRequests.filter(
      (req) => req.id !== userId,
    );

    await this.userRepository.save(user);
    await this.userRepository.save(sender);

    return { message: RESPONSE_MESSAGES.REQUEST_ACCEPTED };
  }

  async declineFriendRequest(userId: number, senderId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['receivedRequests', 'sentRequests'],
    });
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
      relations: ['sentRequests'],
    });

    if (!user) throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);

    if (user.receivedRequests.length === 0) {
      throw new NotFoundException(ERROR_MESSAGES.REQUEST_NOT_FOUND);
    }

    user.receivedRequests = user.receivedRequests.filter(
      (req) => req.id !== senderId,
    );
    sender.sentRequests = sender.sentRequests.filter((req) => req.id !== userId);
    await this.userRepository.save(user);

    return { message: RESPONSE_MESSAGES.REQUEST_DECLINED };
  }

  async getFriends(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });
    if (!user) throw new NotFoundException('User not found.');

    return user.friends;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }
}
