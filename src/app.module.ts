import { Module } from '@nestjs/common';
import { DesafiosModule } from './desafios/desafios.module';
import { PartidasService } from './partidas/partidas.service';
import { PartidasModule } from './partidas/partidas.module';
import { ProxyrmqModule } from './proxyrmq/proxyrmq.module';
import { ConfigModule } from '@nestjs/config';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { DesafioSchema } from './desafios/interfaces/desafio.schema';
import { PartidaSchema } from './partidas/interfaces/partida.schema';

@Module({
  imports: [
    ProxyrmqModule,
    DesafiosModule,
    PartidasModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URL,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    ),

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
