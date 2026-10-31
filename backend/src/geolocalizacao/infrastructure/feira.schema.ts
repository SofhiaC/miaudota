import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Ponto {
  @Prop({ type: String, enum: ['Point'], default: 'Point' }) type: string;
  @Prop({ type: [Number], required: true }) coordinates: number[]; // [longitude, latitude]
}
export const PontoSchema = SchemaFactory.createForClass(Ponto);

@Schema({ collection: 'feiras', timestamps: true })
export class FeiraDocumento {
  @Prop({ required: true, trim: true }) nome: string;
  @Prop({ trim: true }) descricao: string;
  @Prop({ required: true, trim: true }) endereco: string;
  @Prop({ required: true }) latitude: number;
  @Prop({ required: true }) longitude: number;
  @Prop({ type: PontoSchema, required: true }) localizacao: Ponto; // usado na busca geoespacial
  @Prop({ required: true }) dataInicio: Date;
  @Prop({ required: true }) dataFim: Date; // também serve de expiração da feira
  @Prop({ required: true }) id_ong: string;
  @Prop({ type: [String], default: [] }) animais: string[];
}
export const FeiraSchema = SchemaFactory.createForClass(FeiraDocumento);
FeiraSchema.index({ localizacao: '2dsphere' });
