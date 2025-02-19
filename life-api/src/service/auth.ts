import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  /**
   * 验证用户信息
   *
   * @returns
   */
  async validation(username: string, password: string) {
    const encodePassword = crypto.createHash('md5').update(password).digest('hex');
    return {
      username,
      encodePassword
    };
  }

  /**
   * 获取登录用户密码
   *
   * @returns
   */
  async getUserId() {
    const userId = 'a9778270-480b-4357-b8df-23b9a2c59f10';
    if (!userId) {
      throw new Error('用户未登录');
    }
    return userId;
  }
}
