import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'usuarios', timestamps: true })
export class UsuarioDocumento {
  @Prop({ required: true, trim: true }) nome: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) email: string;
  @Prop({ required: true, select: false }) senhaHash: string; // nunca volta em consultas por padrão
  @Prop({ required: true, enum: ['PESSOA', 'ONG'] }) tipo: string;
  @Prop({ required: true }) consentimentoLgpdEm: Date;
}
export const UsuarioSchema = SchemaFactory.createForClass(UsuarioDocumento);
