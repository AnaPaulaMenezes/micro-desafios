import { Module } from '@nestjs/common';
import { PartidasService } from './partidas.service';
import { PartidasController } from './partidas.controller';
import { PartidaSchema } from './interfaces/partida.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DesafioSchema } from 'src/desafios/interfaces/desafio.schema';

import { ProxyrmqModule } from 'src/proxyrmq/proxyrmq.module';

@Module({
  imports: [
    ProxyrmqModule,
    MongooseModule.forFeature([{ name: 'Partida', schema: PartidaSchema }])
  ],
  providers: [PartidasService],
  controllers: [PartidasController]
})
export class PartidasModule { }
