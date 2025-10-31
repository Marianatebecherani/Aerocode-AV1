import { TipoAeronave } from "../enums";
import { Peca } from "./peca";
import { Etapa } from "./etapa";
import { Teste } from "./teste";

export class Aeronave {
    // Atributos
    codigo: string;
    modelo: string;
    tipo: TipoAeronave;
    capacidade: number;
    alcance: number;

    // Relacionamentos
    pecas: Peca[];
    etapas: Etapa[];
    testes: Teste[];

    constructor(
        codigo: string,
        modelo: string,
        tipo: TipoAeronave,
        capacidade: number,
        alcance: number
    ) {
        this.codigo = codigo;
        this.modelo = modelo;
        this.tipo = tipo;
        this.capacidade = capacidade;
        this.alcance = alcance;
        this.pecas = [];
        this.etapas = [];
        this.testes = [];
    }

    detalhes(): void {
        console.log("--- Detalhes da Aeronave ---");
        console.log(`Código: ${this.codigo}`);
        console.log(`Modelo: ${this.modelo}`);
        console.log(`Tipo: ${this.tipo}`);
        console.log(`Capacidade: ${this.capacidade} passageiros`);
        console.log(`Alcance: ${this.alcance} km`);

        console.log(`\n--- Peças (${this.pecas.length}) ---`);
        this.pecas.forEach(p => console.log(`- ${p.nome} (${p.status})`));

        console.log(`\n--- Etapas (${this.etapas.length}) ---`);
        this.etapas.forEach(e => console.log(`- ${e.nome} (${e.status})`));

        console.log(`\n--- Testes (${this.testes.length}) ---`);
        this.testes.forEach(t => console.log(`- ${t.tipo} (${t.resultado})`));
        console.log("-------------------------------");
    }
}