import { StatusTracker } from "../../shared/status-tracker";
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
};

export type AtualizarPecaDTO = {
    nome?: string;
    tipo?: TipoPeca | string;
    fornecedor?: string;
};

export type ListarPecasDTO = {
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
    statusTracker?: StatusTracker<StatusPeca> | StatusTrackerPecaDTO;
};

export class Peca {
    id: string;
    nome: string;
    tipo: TipoPeca;
    fornecedor: string;
    statusTracker: StatusTracker<StatusPeca>;

    constructor(props: PecaProps) {
        Peca.validarId(props.id);
        Peca.validarNome(props.nome);
        Peca.validarFornecedor(props.fornecedor);

        this.id = props.id.trim();
        this.nome = props.nome.trim();
        this.tipo = Peca.normalizarTipo(props.tipo);
        this.fornecedor = props.fornecedor.trim();
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

    private static normalizarTipo(tipo: TipoPeca | string): TipoPeca {
        const tipoNormalizado = tipo?.trim().toUpperCase() as TipoPeca;

        if (!Object.values(TipoPeca).includes(tipoNormalizado)) {
            throw new Error("Tipo da peca invalido.");
        }

        return tipoNormalizado;
    }

}
