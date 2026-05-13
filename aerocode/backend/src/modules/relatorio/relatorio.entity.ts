import { AeronaveDetalhesResponseDTO } from "../aeronave";
import { StatusRelatorio } from "./relatorio-status";

export type CriarRelatorioDTO = {
    aeronaveCodigo: string;
};

export type ListarRelatoriosDTO = {
    aeronaveCodigo?: string;
    dataInicio?: string;
    dataFim?: string;
    page?: string;
    limit?: string;
};

export type PaginacaoResponseDTO = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type RelatorioResponseDTO = {
    id: string;
    aeronaveCodigo: string;
    dataEmissao: string;
    status: StatusRelatorio;
    detalhes: AeronaveDetalhesResponseDTO;
};

export type ListarRelatoriosResponseDTO = {
    dados: RelatorioResponseDTO[];
    paginacao: PaginacaoResponseDTO;
};

export type RelatorioProps = {
    id: string;
    aeronaveCodigo: string;
    dataEmissao: string;
    status: StatusRelatorio | string;
    detalhes: AeronaveDetalhesResponseDTO;
};

export class Relatorio {
    id: string;
    aeronaveCodigo: string;
    dataEmissao: string;
    status: StatusRelatorio;
    detalhes: AeronaveDetalhesResponseDTO;

    constructor(props: RelatorioProps) {
        Relatorio.validarId(props.id);
        Relatorio.validarAeronaveCodigo(props.aeronaveCodigo);
        Relatorio.validarDetalhes(props.detalhes);

        this.id = props.id.trim();
        this.aeronaveCodigo = Relatorio.normalizarAeronaveCodigo(props.aeronaveCodigo);
        this.dataEmissao = Relatorio.normalizarDataEmissao(props.dataEmissao);
        this.status = Relatorio.normalizarStatus(props.status);
        this.detalhes = props.detalhes;
    }

    toPersistence(): RelatorioProps {
        return {
            id: this.id,
            aeronaveCodigo: this.aeronaveCodigo,
            dataEmissao: this.dataEmissao,
            status: this.status,
            detalhes: this.detalhes
        };
    }

    toResponse(): RelatorioResponseDTO {
        return {
            id: this.id,
            aeronaveCodigo: this.aeronaveCodigo,
            dataEmissao: this.dataEmissao,
            status: this.status,
            detalhes: this.detalhes
        };
    }

    private static validarId(id: string): void {
        if (!id || id.trim().length === 0) {
            throw new Error("Id do relatorio e obrigatorio.");
        }
    }

    private static validarAeronaveCodigo(aeronaveCodigo: string): void {
        if (!aeronaveCodigo || aeronaveCodigo.trim().length === 0) {
            throw new Error("Codigo da aeronave do relatorio e obrigatorio.");
        }
    }

    private static normalizarAeronaveCodigo(aeronaveCodigo: string): string {
        Relatorio.validarAeronaveCodigo(aeronaveCodigo);
        return aeronaveCodigo.trim().toUpperCase();
    }

    private static validarDetalhes(detalhes: AeronaveDetalhesResponseDTO): void {
        if (!detalhes) {
            throw new Error("Detalhes da aeronave sao obrigatorios para o relatorio.");
        }
    }

    private static normalizarDataEmissao(dataEmissao: string): string {
        if (!dataEmissao || dataEmissao.trim().length === 0) {
            throw new Error("Data de emissao do relatorio e obrigatoria.");
        }

        const data = new Date(dataEmissao.trim());
        if (Number.isNaN(data.getTime())) {
            throw new Error("Data de emissao do relatorio deve ser uma data valida.");
        }

        return data.toISOString();
    }

    private static normalizarStatus(status: StatusRelatorio | string): StatusRelatorio {
        if (!status || status.trim().length === 0) {
            throw new Error("Status do relatorio e obrigatorio.");
        }

        const statusNormalizado = status.trim().toUpperCase() as StatusRelatorio;
        if (!Object.values(StatusRelatorio).includes(statusNormalizado)) {
            throw new Error("Status do relatorio invalido.");
        }

        return statusNormalizado;
    }
}
