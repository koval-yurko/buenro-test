import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'data', timestamps: true })
export class Data extends Document {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  source: string;

  @Prop({ required: true, index: true })
  ingestedAt: Date;

  @Prop({ index: true })
  name?: string;

  @Prop({ index: true })
  isAvailable?: boolean;

  @Prop({ index: true })
  price?: number;

  @Prop({ type: Object })
  props?: Record<string, any>;
}

export const DataSchema = SchemaFactory.createForClass(Data);

// Create compound indexes
DataSchema.index({ id: 1, source: 1 }, { unique: true }); // For deduplication
