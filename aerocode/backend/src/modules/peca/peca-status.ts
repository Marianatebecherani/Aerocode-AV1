import { StatusInfo, StatusRegistro, StatusTracker } from "../../shared/tracker";

export enum StatusPeca {
    EM_PRODUCAO = "EM_PRODUCAO",
    EM_TRANSPORTE = "EM_TRANSPORTE",
    PRONTA = "PRONTA"
}

export type StatusTrackerPecaDTO = {
    atual: StatusRegistro<StatusPeca> | null;
    historico: StatusRegistro<StatusPeca>[];
};

export const statusPecaInfo: StatusInfo<StatusPeca>[] = [
    { codigo: StatusPeca.EM_PRODUCAO, ordem: 1, descricao: "Em producao" },
    { codigo: StatusPeca.EM_TRANSPORTE, ordem: 2, descricao: "Em transporte" },
    { codigo: StatusPeca.PRONTA, ordem: 3, descricao: "Pronta" }
];

export function criarStatusTrackerPeca(
    historico: StatusRegistro<StatusPeca>[] = []
): StatusTracker<StatusPeca> {
    if (historico.length > 0) {
        return new StatusTracker(statusPecaInfo, false, historico);
    }

    return new StatusTracker(statusPecaInfo);
}

export function statusTrackerPecaToDTO(
    statusTracker: StatusTracker<StatusPeca>
): StatusTrackerPecaDTO {
    return {
        atual: statusTracker.atual,
        historico: statusTracker.listarHistorico()
    };
}
