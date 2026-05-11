import { StatusTracker } from "../../shared/tracker";
import {
    criarStatusTrackerPeca,
    StatusPeca,
    statusTrackerPecaToDTO,
    StatusTrackerPecaDTO
} from "./peca-status";

export enum TipoPeca {
    NACIONAL = "NACIONAL",
    IMPORTADA = "IMPORTADA"
}

export type CriarPecaDTO = {
    nome: string;
    tipo: TipoPeca | string;
    fornecedor: string;
    aeronaveCodigo: string;
};

export type AtualizarPecaDTO = {
    nome?: string;
    tipo?: TipoPeca | string;
    fornecedor?: string;
    aeronaveCodigo?: string;
};

export type ListarPecasDTO = {
    aeronaveCodigo?: string;
    tipo?: string;
    status?: string;
    termo?: string;
    page?: string;
    limit?: string;
};

export type PaginacaoResponseDTO = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type PecaResponseDTO = {
    id: string;
    nome: string;
    tipo: TipoPeca;
    fornecedor: string;
    aeronaveCodigo: string;
    statusTracker: StatusTrackerPecaDTO;
};

export type ListarPecasResponseDTO = {
    dados: PecaResponseDTO[];
    paginacao: PaginacaoResponseDTO;
};

export type PecaProps = {
    id: string;
    nome: string;
    tipo: TipoPeca | string;
    fornecedor: string;
    aeronaveCodigo: string;
    statusTracker?: StatusTracker<StatusPeca> | StatusTrackerPecaDTO;
};

export class Peca {
    id: string;
    nome: string;
    tipo: TipoPeca;
    fornecedor: string;
    aeronaveCodigo: string;
    statusTracker: StatusTracker<StatusPeca>;

    constructor(props: PecaProps) {
        Peca.validarId(props.id);
        Peca.validarNome(props.nome);
        Peca.validarFornecedor(props.fornecedor);
        Peca.validarAeronaveCodigo(props.aeronaveCodigo);

        this.id = props.id.trim();
        this.nome = props.nome.trim();
        this.tipo = Peca.normalizarTipo(props.tipo);
        this.fornecedor = props.fornecedor.trim();
        this.aeronaveCodigo = Peca.normalizarAeronaveCodigo(props.aeronaveCodigo);
        this.statusTracker = Peca.criarStatusTracker(props);
    }

    atualizarStatus(novoStatus: StatusPeca): void {
        this.statusTracker.alterarPara(novoStatus);
    }

    prosseguirStatus(): void {
        this.statusTracker.prosseguirEtapa();
    }

    retrocederStatus(): void {
        this.statusTracker.retrocederEtapa();
    }

    toResponse(): PecaResponseDTO {
        return {
            id: this.id,
            nome: this.nome,
            tipo: this.tipo,
            fornecedor: this.fornecedor,
            aeronaveCodigo: this.aeronaveCodigo,
            statusTracker: statusTrackerPecaToDTO(this.statusTracker)
        };
    }

    private static criarStatusTracker(props: PecaProps): StatusTracker<StatusPeca> {
        if (props.statusTracker instanceof StatusTracker) {
            return props.statusTracker;
        }

        return criarStatusTrackerPeca(props.statusTracker?.historico);
    }

    private static validarId(id: string): void {
        if (!id || id.trim().length === 0) {
            throw new Error("Id da peca e obrigatorio.");
        }
    }

    private static validarNome(nome: string): void {
        if (!nome || nome.trim().length === 0) {
            throw new Error("Nome da peca e obrigatorio.");
        }
    }

    private static validarFornecedor(fornecedor: string): void {
        if (!fornecedor || fornecedor.trim().length === 0) {
            throw new Error("Fornecedor da peca e obrigatorio.");
        }
    }

    private static validarAeronaveCodigo(aeronaveCodigo: string): void {
        if (!aeronaveCodigo || aeronaveCodigo.trim().length === 0) {
            throw new Error("Codigo da aeronave da peca e obrigatorio.");
        }
    }

    private static normalizarAeronaveCodigo(aeronaveCodigo: string): string {
        Peca.validarAeronaveCodigo(aeronaveCodigo);
        return aeronaveCodigo.trim().toUpperCase();
    }

    private static normalizarTipo(tipo: TipoPeca | string): TipoPeca {
        const tipoNormalizado = tipo?.trim().toUpperCase() as TipoPeca;

        if (!Object.values(TipoPeca).includes(tipoNormalizado)) {
            throw new Error("Tipo da peca invalido.");
        }

        return tipoNormalizado;
    }

}
