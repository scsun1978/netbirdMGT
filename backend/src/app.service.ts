import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'NetBird Management Platform API is running!';
  }
}
