import { StatusInfo, StatusRegistro, StatusTracker } from "../../shared/status-tracker";

export enum StatusEtapa {
    PENDENTE = "PENDENTE",
    ANDAMENTO = "EM_ANDAMENTO",
    EM_ANDAMENTO = "EM_ANDAMENTO",
    CONCLUIDA = "CONCLUIDA"
}

export type StatusTrackerEtapaDTO = {
    atual: StatusRegistro<StatusEtapa> | null;
    historico: StatusRegistro<StatusEtapa>[];
};

export const statusEtapaInfo: StatusInfo<StatusEtapa>[] = [
    { codigo: StatusEtapa.PENDENTE, ordem: 1, descricao: "Pendente" },
    { codigo: StatusEtapa.EM_ANDAMENTO, ordem: 2, descricao: "Em andamento" },
    { codigo: StatusEtapa.CONCLUIDA, ordem: 3, descricao: "Concluida" }
];

export function criarStatusTrackerEtapa(
    historico: StatusRegistro<StatusEtapa>[] = []
): StatusTracker<StatusEtapa> {
    if (historico.length > 0) {
        return new StatusTracker(statusEtapaInfo, false, historico);
    }

    return new StatusTracker(statusEtapaInfo);
}

export function statusTrackerEtapaToDTO(
    statusTracker: StatusTracker<StatusEtapa>
): StatusTrackerEtapaDTO {
    return {
        atual: statusTracker.atual,
        historico: statusTracker.listarHistorico()
    };
}
