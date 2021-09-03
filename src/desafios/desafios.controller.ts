import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { DesafiosService } from './desafios.service';
import { Desafio } from './interfaces/desafio.interface';


const ackErrors: string[] = ['E11000'];
@Controller()
export class DesafiosController {
    constructor(private readonly desafiosService: DesafiosService) { }

    private readonly logger = new Logger(DesafiosController.name)


    @EventPattern('criar-desafio')
    async criarDesafio(@Payload() desafio: Desafio, @Ctx() context: RmqContext,) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        this.logger.log(`desafio: ${JSON.stringify(desafio)}`)
        try {
            await this.desafiosService.criarDesafio(desafio);
            await channel.ack(originalMsg);
        } catch (error) {
            const filterAckError = ackErrors.filter((ackError) =>
                error.message.includes(ackError),
            );
            if (filterAckError.length > 0) {
                await channel.ack(originalMsg);
            }
        }

    }

    @MessagePattern('consultar-desafios')
    async consultarDesafios(@Payload() data: any, @Ctx() context: RmqContext,): Promise<Desafio | Desafio[]> {

        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            const idJogador = data.idJogador;
            const _id = data._id;
            if (idJogador) {
                return await this.desafiosService.consultarDesafiosJogador(idJogador)
            } else if (_id) {
                return await this.desafiosService.consultarDesafiosPorId(_id);
            }
            else {
                return await this.desafiosService.consultarTodosDesafios();
            }
        } finally {
            await channel.ack(originalMsg);
        }
    }

    @MessagePattern('consultar-desafios-realizados')
    async consultarDesafiosRealizados(@Payload() data: any, @Ctx() context: RmqContext,): Promise<Desafio | Desafio[]> {

        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            const { idCategoria, dataRef } = data
            if (dataRef) {
                return await this.desafiosService.consultarDesafiosRealizadosPorData(idCategoria, dataRef);
            } else {
                return await this.desafiosService.consultarDesafiosRealizados(idCategoria);
            }

        } finally {
            await channel.ack(originalMsg);
        }
    }

    @EventPattern('atualizar-desafio')
    async atualizarDesafio(
        @Payload() atualizarDesafio: Desafio,
        @Ctx() context: RmqContext): Promise<void> {

        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            const _id: string = atualizarDesafio._id;

            await this.desafiosService.atualizarDesafio(_id, atualizarDesafio);
            await channel.ack(originalMsg);
        } catch (error) {
            const filterAckError = ackErrors.filter((ackError) =>
                error.message.includes(ackError),
            );
            if (filterAckError.length > 0) {
                await channel.ack(originalMsg);
            }
        }

    }

    @EventPattern('atribuir-desafio-partida')
    async atribuirDesafioPartida(
        @Payload() data: any,
        @Ctx() context: RmqContext): Promise<void> {

        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            const idPartida: string = data.idPartida;
            const desafio: Desafio = data.desafio;
            await this.desafiosService.atribuirDesafioPartida(idPartida, desafio);
            await channel.ack(originalMsg);
        } catch (error) {
            const filterAckError = ackErrors.filter((ackError) =>
                error.message.includes(ackError),
            );
            if (filterAckError.length > 0) {
                await channel.ack(originalMsg);
            }
        }

    }

    @EventPattern('deletar-desafio')
    async deletarDesafio(@Payload() desafio: Desafio, @Ctx() context: RmqContext): Promise<void> {

        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            await this.desafiosService.deletarDesafio(desafio);
            await channel.ack(originalMsg);
        } catch (error) {
            const filterAckError = ackErrors.filter((ackError) =>
                error.message.includes(ackError),
            );
            if (filterAckError.length > 0) {
                await channel.ack(originalMsg);
            }
        }


    }
}

