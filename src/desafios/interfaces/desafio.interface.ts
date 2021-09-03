import { Document } from 'mongoose'
import { Partida } from 'src/partidas/interfaces/partida.interface'

import { DesafioStatus } from './enum-status.enum'



export interface Desafio extends Document {
    dataHoraDesafio: Date;
    status: DesafioStatus;
    dataHoraSolicitacao: Date;
    dataHoraResposta?: Date;
    solicitante: string;
    categoria: string;
    jogadores: string[]
    partida?: Partida;
}



