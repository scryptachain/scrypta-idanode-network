import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RewardDocument = Reward & Document;

@Schema()
export class Reward {

  @Prop({ required: true })
  node: string;

  @Prop({ required: true })
  block: number; 

  @Prop({ required: true })
  toindex: number;
  
  @Prop({ required: true })
  paid: boolean;

  @Prop({ required: true })
  timestamp: string;

  @Prop({ required: true })
  ref: string;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);