import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Partida } from './interfaces/partida.interface';
import { PartidasService } from './partidas.service';


const ackErrors: string[] = ['E11000'];
@Controller('partidas')
export class PartidasController {
    constructor(private readonly partidaService: PartidasService) { }

    private readonly logger = new Logger(PartidasController.name)

    @EventPattern('criar-partida')
    async criarPartida(
        @Payload() partida: Partida,
        @Ctx() context: RmqContext): Promise<void> {

        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            this.logger.log(`partida ${JSON.stringify(partida)}`);


            await this.partidaService.criarPartida(partida);
            await channel.ack(originalMsg);
        } catch (error) {
            const filterAckError = ackErrors.filter((ackError) =>
                error.message.includes(ackError),
            );
            if (filterAckError.length > 0) {
                await channel.ack(originalMsg);
                return
            }
            await channel.nack(originalMsg)
        }

    }
}
