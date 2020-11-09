import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MongooseModule } from '@nestjs/mongoose';
import { Reward, RewardSchema } from './schemas/reward.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/pool?retryWrites=true&w=1'),
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
