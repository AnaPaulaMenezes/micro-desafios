import { Module } from '@nestjs/common';
import { DesafiosService } from './desafios.service';
import { DesafiosController } from './desafios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DesafioSchema } from './interfaces/desafio.schema';
import { PartidaSchema } from 'src/partidas/interfaces/partida.schema';
import { ProxyrmqModule } from 'src/proxyrmq/proxyrmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Desafio', schema: DesafioSchema }, { name: 'Partida', schema: PartidaSchema }]), ProxyrmqModule

  ],
  providers: [DesafiosService],
  controllers: [DesafiosController]
})
export class DesafiosModule { }
