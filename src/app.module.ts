import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MongooseModule } from '@nestjs/mongoose';
import { Reward, RewardSchema } from './schemas/reward.schema';
require('dotenv').config()

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION),
    MongooseModule.forFeature(
      [
        { name: Reward.name, schema: RewardSchema },
      ]
    )
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
