export enum TipoAeronave {
    COMERCIAL = "COMERCIAL",
    MILITAR = "MILITAR"
}

export { StatusEtapa } from "../modules/etapa";
export { NivelPermissao } from "../modules/funcionario";
export { StatusPeca, TipoPeca } from "../modules/peca";

export enum TipoTeste {
    ELETRICO = "ELETRICO",
    HIDRAULICO = "HIDRAULICO",
    AERODINAMICO = "AERODINAMICO"
}

export enum ResultadoTeste {
    APROVADO = "APROVADO",
    REPROVADO = "REPROVADO"
}
