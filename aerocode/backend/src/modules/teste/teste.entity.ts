import {
    criarResultadoTrackerTeste,
    ResultadoTeste,
    resultadoTrackerTesteToDTO,
    ResultadoTracker,
    ResultadoTrackerTesteDTO
} from "./teste-resultado";

export enum TipoTeste {
    ELETRICO = "ELETRICO",
    HIDRAULICO = "HIDRAULICO",
    AERODINAMICO = "AERODINAMICO"
}

export type CriarTesteDTO = {
    tipo: TipoTeste | string;
    resultado: ResultadoTeste | string;
    aeronaveCodigo: string;
};

export type AtualizarTesteDTO = {
    tipo?: TipoTeste | string;
    aeronaveCodigo?: string;
};

export type ListarTestesDTO = {
    aeronaveCodigo?: string;
    tipo?: string;
    resultado?: string;
    page?: string;
    limit?: string;
};

export type PaginacaoResponseDTO = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type TesteResponseDTO = {
    id: string;
    tipo: TipoTeste;
    aeronaveCodigo: string;
    resultadoTracker: ResultadoTrackerTesteDTO;
};

export type ListarTestesResponseDTO = {
    dados: TesteResponseDTO[];
    paginacao: PaginacaoResponseDTO;
};

export type TesteProps = {
    id: string;
    tipo: TipoTeste | string;
    aeronaveCodigo: string;
    resultado?: ResultadoTeste | string;
    resultadoTracker?: ResultadoTracker | ResultadoTrackerTesteDTO;
};

export class Teste {
    id: string;
    tipo: TipoTeste;
    aeronaveCodigo: string;
    resultadoTracker: ResultadoTracker;

    constructor(props: TesteProps) {
        Teste.validarId(props.id);
        Teste.validarAeronaveCodigo(props.aeronaveCodigo);

        this.id = props.id.trim();
        this.tipo = Teste.normalizarTipo(props.tipo);
        this.aeronaveCodigo = Teste.normalizarAeronaveCodigo(props.aeronaveCodigo);
        this.resultadoTracker = Teste.criarResultadoTracker(props);
    }

    toResponse(): TesteResponseDTO {
        return {
            id: this.id,
            tipo: this.tipo,
            aeronaveCodigo: this.aeronaveCodigo,
            resultadoTracker: resultadoTrackerTesteToDTO(this.resultadoTracker)
        };
    }

    alterarResultado(resultado: ResultadoTeste | string): void {
        this.resultadoTracker.alterarPara(Teste.normalizarResultado(resultado), new Date(), false);
    }

    aprovar(): void {
        this.alterarResultado(ResultadoTeste.APROVADO);
    }

    reprovar(): void {
        this.alterarResultado(ResultadoTeste.REPROVADO);
    }

    private static criarResultadoTracker(props: TesteProps): ResultadoTracker {
        if (props.resultadoTracker instanceof ResultadoTracker) {
            return props.resultadoTracker;
        }

        return criarResultadoTrackerTeste(
            props.resultadoTracker?.historico,
            props.resultado ? Teste.normalizarResultado(props.resultado) : undefined
        );
    }

    private static validarId(id: string): void {
        if (!id || id.trim().length === 0) {
            throw new Error("Id do teste e obrigatorio.");
        }
    }

    private static validarAeronaveCodigo(aeronaveCodigo: string): void {
        if (!aeronaveCodigo || aeronaveCodigo.trim().length === 0) {
            throw new Error("Codigo da aeronave do teste e obrigatorio.");
        }
    }

    private static normalizarAeronaveCodigo(aeronaveCodigo: string): string {
        Teste.validarAeronaveCodigo(aeronaveCodigo);
        return aeronaveCodigo.trim().toUpperCase();
    }

    private static normalizarTipo(tipo: TipoTeste | string): TipoTeste {
        const tipoNormalizado = tipo?.trim().toUpperCase() as TipoTeste;

        if (!Object.values(TipoTeste).includes(tipoNormalizado)) {
            throw new Error("Tipo do teste invalido.");
        }

        return tipoNormalizado;
    }

    private static normalizarResultado(resultado: ResultadoTeste | string): ResultadoTeste {
        const resultadoNormalizado = resultado?.trim().toUpperCase() as ResultadoTeste;

        if (!Object.values(ResultadoTeste).includes(resultadoNormalizado)) {
            throw new Error("Resultado do teste invalido.");
        }

        return resultadoNormalizado;
    }
}
