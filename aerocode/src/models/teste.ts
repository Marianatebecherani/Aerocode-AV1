import { TipoTeste, ResultadoTeste } from "../enums";

export class Teste {
    tipo: TipoTeste;
    resultado: ResultadoTeste;

    constructor(tipo: TipoTeste, resultado: ResultadoTeste) {
        this.tipo = tipo;
        this.resultado = resultado;
    }

    // Métodos salvar/carregar não são implementados aqui, pois
    // testes são salvos como parte do objeto Aeronave.
    salvar(): void {
        console.warn("Teste é salvo como parte da Aeronave.");
    }

    carregar(): void {
        console.warn("Teste é carregado como parte da Aeronave.");
    }
}