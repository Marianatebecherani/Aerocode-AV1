import { Tracker, TrackerInfo, TrackerRegistro } from "../../shared/tracker";

export enum ResultadoTeste {
    APROVADO = "APROVADO",
    REPROVADO = "REPROVADO"
}

export type ResultadoRegistro = TrackerRegistro<ResultadoTeste, "resultado">;

export type ResultadoTrackerTesteDTO = {
    atual: ResultadoRegistro | null;
    historico: ResultadoRegistro[];
};

export const resultadoTesteInfo: TrackerInfo<ResultadoTeste>[] = [
    { codigo: ResultadoTeste.APROVADO, ordem: 1, descricao: "Aprovado" },
    { codigo: ResultadoTeste.REPROVADO, ordem: 1, descricao: "Reprovado" }
];

export class ResultadoTracker extends Tracker<ResultadoTeste, "resultado"> {
    constructor(historico: ResultadoRegistro[] = [], iniciarNoPrimeiroResultado = false) {
        super(resultadoTesteInfo, "resultado", iniciarNoPrimeiroResultado, historico);
    }
}

export function criarResultadoTrackerTeste(
    historico: ResultadoRegistro[] = [],
    resultadoInicial?: ResultadoTeste
): ResultadoTracker {
    if (historico.length > 0) {
        return new ResultadoTracker(historico);
    }

    const tracker = new ResultadoTracker();

    if (resultadoInicial) {
        tracker.alterarPara(resultadoInicial);
    }

    return tracker;
}

export function resultadoTrackerTesteToDTO(
    resultadoTracker: ResultadoTracker
): ResultadoTrackerTesteDTO {
    return {
        atual: resultadoTracker.atual,
        historico: resultadoTracker.listarHistorico()
    };
}
