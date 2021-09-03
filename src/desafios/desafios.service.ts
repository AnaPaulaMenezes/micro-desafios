import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import * as momentTimezone from 'moment-timezone';
import { Model } from 'mongoose';
import { Partida } from 'src/partidas/interfaces/partida.interface';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';

import { Desafio } from './interfaces/desafio.interface';
import { DesafioStatus } from './interfaces/enum-status.enum';

@Injectable()
export class DesafiosService {


    constructor(
        @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
        @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
        private clientProxySmartRanking: ClientProxySmartRanking
    ) { }

    private readonly logger = new Logger(DesafiosService.name);

    private clientNotificacoes = this.clientProxySmartRanking.getClientProxyNotificationsInstance();

    async criarDesafio(desafio: Desafio): Promise<Desafio> {
        this.logger.log(`Desafio: ${JSON.stringify(desafio)}`);

        try {
            const desafioCriado = new this.desafioModel(desafio);
            desafioCriado.status = DesafioStatus.PENDENTE;
            await desafioCriado.save();

            return await this.clientNotificacoes.emit('notificacao-novo-desafio', desafio).toPromise()
        } catch (error) {
            this.logger.error(`error: ${JSON.stringify(error.message)}`);
            throw new RpcException(error.message);
        }

    }

    async consultarTodosDesafios(): Promise<Desafio[]> {
        return await this.desafioModel.find()
            .exec();
    }

    async consultarDesafiosJogador(_id: any): Promise<Desafio | Desafio[]> {
        this.logger.log(`_id: ${_id}`);
        try {
            return await this.desafioModel.find()
                .where('jogadores')
                .in(_id)
                .exec();
        } catch (error) {
            this.logger.log(`Error: ${JSON.stringify(error.message)}`);
            throw new RpcException(error.message);
        }

    }

    async consultarDesafiosRealizados(_id: string): Promise<Desafio[]> {
        this.logger.log(`_id: ${_id}`);
        try {
            return await this.desafioModel.find()
                .where('categoria')
                .equals(_id)
                .where('status')
                .equals(DesafioStatus.REALIZADO)
                .exec();

        } catch (error) {
            this.logger.log(`Error: ${JSON.stringify(error.message)}`);
            throw new RpcException(error.message);
        }

    }

    async consultarDesafiosRealizadosPorData(_id: string, dataRef: string): Promise<Desafio[]> {
        this.logger.log(`_id: ${_id}, dataRef ${dataRef}`);
        try {
            const dataRefNew = `${dataRef} 23:59:59.999`
            const dateFormat = 'YYYY-MM-DD HH:mm:ss.SSS+00:00';
            const dataFormatada = new Date(momentTimezone(dataRefNew).tz('UTC').format(dateFormat)).getTime();

            return await this.desafioModel.find()
                .where('categoria')
                .equals(_id)
                .where('status')
                .equals(DesafioStatus.REALIZADO)
                .where('dataHoraDesafio')
                .lte(dataFormatada)
                .exec();

        } catch (error) {
            this.logger.error(`Error: ${JSON.stringify(error.message)}`);
            throw new RpcException(error.message);
        }

    }

    async consultarDesafiosPorId(_id: any): Promise<Desafio> {
        try {
            const desafio = await this.desafioModel
                .findById(_id)
                .exec();

            return desafio;
        } catch (error) {
            this.logger.log(`Error: ${JSON.stringify(error.message)}`);
            throw new RpcException(error.message);
        }

    }

    async atualizarDesafio(_id: string, desafio: Desafio) {
        try {
            desafio.dataHoraResposta = new Date();
            await this.desafioModel.findOneAndUpdate({ _id }, { $set: desafio }).exec();

        } catch (error) {
            this.logger.log(`Error: ${JSON.stringify(error.message)}`);
            throw new RpcException(error.message);
        }

    }

    async atribuirDesafioPartida(idPartida: string, desafio: Desafio): Promise<void> {
        try {

            const desafioEncontrado = await this.desafioModel.findById(desafio._id).exec();

            if (!desafioEncontrado) {
                throw new NotFoundException(`Desafio ${desafio._id} não encontrado`);
            }

            const partida = await this.partidaModel.findById(idPartida).exec();

            if (!partida) {
                throw new NotFoundException(`partida ${idPartida} não encontrado`);
            }


            desafioEncontrado.status = DesafioStatus.REALIZADO;
            desafioEncontrado.partida = partida;

            try {
                await this.desafioModel.findOneAndUpdate({ _id: desafio._id }, { $set: desafioEncontrado }).exec();
            } catch (error) {
                await this.partidaModel.deleteOne({ _id: idPartida }).exec();
                throw new InternalServerErrorException()
            }
        } catch (error) {
            this.logger.log(`Error: ${JSON.stringify(error.message)}`);
            throw new RpcException(error.message);
        }
    }

    async deletarDesafio(desafio: Desafio): Promise<void> {
        try {

            desafio.status = DesafioStatus.CANCELADO;
            await this.desafioModel.findOneAndUpdate({ _id: desafio._id }, { $set: desafio }).exec();
        } catch (error) {
            this.logger.log(`Error: ${JSON.stringify(error.message)}`);
            throw new RpcException(error.message);
        }
    }

}
