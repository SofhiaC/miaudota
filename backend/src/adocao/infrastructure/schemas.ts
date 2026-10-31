import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'animais', timestamps: true })
export class AnimalDocumento {
  @Prop({ required: true, trim: true }) nome: string;
  @Prop({ required: true, trim: true, lowercase: true }) especie: string;
  @Prop({ required: true }) idade: number;
  @Prop({ trim: true }) descricao: string;
  @Prop({ required: true }) id_dono: string;
  @Prop({ default: true }) disponivel: boolean;
}
export const AnimalSchema = SchemaFactory.createForClass(AnimalDocumento);
AnimalSchema.index({ id_dono: 1 });

@Schema({ collection: 'favoritos', timestamps: true })
export class FavoritoDocumento {
  @Prop({ required: true }) id_adotante: string;
  @Prop({ required: true }) id_animal: string;
}
export const FavoritoSchema = SchemaFactory.createForClass(FavoritoDocumento);
FavoritoSchema.index({ id_adotante: 1, id_animal: 1 }, { unique: true });

@Schema({ collection: 'solicitacoes', timestamps: true })
export class SolicitacaoDocumento {
  @Prop({ required: true }) id_adotante: string;
  @Prop({ required: true }) id_animal: string;
  @Prop({ default: 'PENDENTE', enum: ['PENDENTE', 'APROVADA', 'RECUSADA'] }) status: string;
}
export const SolicitacaoSchema = SchemaFactory.createForClass(SolicitacaoDocumento);
