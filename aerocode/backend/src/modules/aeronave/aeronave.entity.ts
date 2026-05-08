import { EtapaResponseDTO } from "../etapa";
import { NivelPermissao } from "../funcionario";
import { PecaResponseDTO } from "../peca";
import { TesteResponseDTO } from "../teste";

export enum TipoAeronave {
    COMERCIAL = "COMERCIAL",
    MILITAR = "MILITAR"
}

export type CriarAeronaveDTO = {
    modelo: string;
    tipo: TipoAeronave | string;
    capacidade: number;
    alcance: number;
};

export type AtualizarAeronaveDTO = {
    modelo?: string;
    tipo?: TipoAeronave | string;
    capacidade?: number;
    alcance?: number;
};

export type ListarAeronavesDTO = {
    modelo?: string;
    tipo?: string;
    capacidadeMin?: string;
    capacidadeMax?: string;
    alcanceMin?: string;
    alcanceMax?: string;
    page?: string;
    limit?: string;
};

export type PaginacaoResponseDTO = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type AeronaveResponseDTO = {
    codigo: string;
    modelo: string;
    tipo: TipoAeronave;
    capacidade: number;
    alcance: number;
    pecas: PecaResponseDTO[];
    etapas: EtapaResponseDTO[];
    testes: TesteResponseDTO[];
};

export type ListarAeronavesResponseDTO = {
    dados: AeronaveResponseDTO[];
    paginacao: PaginacaoResponseDTO;
};

export type AeronaveDetalhesFuncionarioDTO = {
    nome: string;
    funcao: NivelPermissao;
};

export type AeronaveDetalhesEtapaDTO = {
    nome: string;
    prazoConclusao: string;
    prioridade: number;
    status: string | null;
    data: string | null;
    funcionarios: AeronaveDetalhesFuncionarioDTO[];
};

export type AeronaveDetalhesPecaDTO = {
    nome: string;
    tipo: string;
    fornecedor: string;
    status: string | null;
    data: string | null;
};

export type AeronaveDetalhesTesteDTO = {
    tipo: string;
    resultado: string | null;
    data: string | null;
};

export type AeronaveDetalhesResponseDTO = {
    codigo: string;
    modelo: string;
    tipo: TipoAeronave;
    capacidade: number;
    alcance: number;
    etapas: AeronaveDetalhesEtapaDTO[];
    pecas: AeronaveDetalhesPecaDTO[];
    testes: AeronaveDetalhesTesteDTO[];
};

export type AeronaveProps = {
    codigo: string;
    modelo: string;
    tipo: TipoAeronave | string;
    capacidade: number;
    alcance: number;
};

export class Aeronave {
    codigo: string;
    modelo: string;
    tipo: TipoAeronave;
    capacidade: number;
    alcance: number;

    constructor(props: AeronaveProps) {
        Aeronave.validarCodigo(props.codigo);
        Aeronave.validarModelo(props.modelo);

        this.codigo = props.codigo.trim();
        this.modelo = props.modelo.trim();
        this.tipo = Aeronave.normalizarTipo(props.tipo);
        this.capacidade = Aeronave.normalizarInteiroPositivo(props.capacidade, "Capacidade");
        this.alcance = Aeronave.normalizarInteiroPositivo(props.alcance, "Alcance");
    }

    toPersistence(): AeronaveProps {
        return {
            codigo: this.codigo,
            modelo: this.modelo,
            tipo: this.tipo,
            capacidade: this.capacidade,
            alcance: this.alcance
        };
    }

    toResponse(relacionamentos: {
        pecas: PecaResponseDTO[];
        etapas: EtapaResponseDTO[];
        testes: TesteResponseDTO[];
    }): AeronaveResponseDTO {
        return {
            codigo: this.codigo,
            modelo: this.modelo,
            tipo: this.tipo,
            capacidade: this.capacidade,
            alcance: this.alcance,
            pecas: relacionamentos.pecas,
            etapas: relacionamentos.etapas,
            testes: relacionamentos.testes
        };
    }

    private static validarCodigo(codigo: string): void {
        if (!codigo || codigo.trim().length === 0) {
            throw new Error("Codigo da aeronave e obrigatorio.");
        }
    }

    private static validarModelo(modelo: string): void {
        if (!modelo || modelo.trim().length === 0) {
            throw new Error("Modelo da aeronave e obrigatorio.");
        }
    }

    private static normalizarTipo(tipo: TipoAeronave | string): TipoAeronave {
        const tipoNormalizado = tipo?.trim().toUpperCase() as TipoAeronave;

        if (!Object.values(TipoAeronave).includes(tipoNormalizado)) {
            throw new Error("Tipo da aeronave invalido.");
        }

        return tipoNormalizado;
    }

    private static normalizarInteiroPositivo(valor: number, campo: string): number {
        const numero = Number(valor);

        if (!Number.isInteger(numero) || numero < 0) {
            throw new Error(`${campo} da aeronave deve ser um numero inteiro positivo ou zero.`);
        }

        return numero;
    }
}
