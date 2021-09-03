import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DesafiosService } from 'src/desafios/desafios.service';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { Partida } from './interfaces/partida.interface';

@Injectable()
export class PartidasService {
    constructor(
        @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
        private clientProxySmartRanking: ClientProxySmartRanking
    ) { }

    private clientDesafios =
        this.clientProxySmartRanking.getClientProxyDesafiosInstance();

    private clientRankings = this.clientProxySmartRanking.getClientProxyRankingsInstance();

    private readonly logger = new Logger(DesafiosService.name);

    async criarPartida(partida: Partida): Promise<Partida> {
        try {
            const partidaCriada = new this.partidaModel(partida);
            this.logger.log(`partidaCriada ${partidaCriada}`)
            const resultado = await partidaCriada.save();
            const idPartida = resultado._id;

            const desafio = await this.clientDesafios.send('consultar-desafios', { idJogador: '', _id: partida.desafio }).toPromise();

            await this.clientDesafios.emit('atribuir-desafio-partida', { idPartida, desafio }).toPromise();

            return await this.clientRankings.emit('processar-partida', { idPartida, partida }).toPromise();
        } catch (error) {
            this.logger.error(`error: ${JSON.stringify(error.message)}`);
            throw new RpcException(error.message);
        }
    }
}
