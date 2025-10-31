import { TipoPeca, StatusPeca } from "../enums";

export class Peca {
    nome: string;
    tipo: TipoPeca;
    fornecedor: string;
    status: StatusPeca;

    constructor(nome: string, tipo: TipoPeca, fornecedor: string) {
        this.nome = nome;
        this.tipo = tipo;
        this.fornecedor = fornecedor;
        this.status = StatusPeca.EM_PRODUCAO; // Status inicial
    }

    atualizarStatus(novoStatus: StatusPeca): void {
        this.status = novoStatus;
        console.log(`Status da peça ${this.nome} atualizado para ${novoStatus}`);
    }

    // peças são salvas como parte do objeto Aeronave.
    salvar(): void {
        console.warn("Peça é salva como parte da Aeronave.");
    }

    carregar(): void {
        console.warn("Peça é carregada como parte da Aeronave.");
    }
}