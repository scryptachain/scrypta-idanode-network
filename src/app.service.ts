import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'REWARD POOL UP AND RUNNING'
  }
}