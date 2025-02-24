import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  lastName: string;

  @Column({ type: 'integer', nullable: true })
  age: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @ManyToMany(() => User, (user) => user.friends)
  @JoinTable({ name: 'friends' })
  friends: User[];

  @ManyToMany(() => User, (user) => user.sentRequests)
  @JoinTable({ name: 'friend_requests' })
  sentRequests: User[];

  @ManyToMany(() => User, (user) => user.receivedRequests)
  @JoinTable({ name: 'received_requests' })
  receivedRequests: User[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  toJSON() {
    const { password, ...userData } = this;
    return userData;
  }
}
