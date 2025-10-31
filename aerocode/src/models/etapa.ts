import { StatusEtapa } from "../enums";
import { Funcionario } from "./funcionario";

export class Etapa {
    nome: string;
    prazo: string; // Ex: "10 dias"
    status: StatusEtapa;
    funcionarios: Funcionario[]; // Relação de associação

    constructor(nome: string, prazo: string) {
        this.nome = nome;
        this.prazo = prazo;
        this.status = StatusEtapa.PENDENTE;
        this.funcionarios = [];
    }

    iniciar(): void {
        if (this.status === StatusEtapa.PENDENTE) {
            this.status = StatusEtapa.ANDAMENTO;
            console.log(`Etapa ${this.nome} iniciada.`);
        } else {
            console.log(`Etapa ${this.nome} não pode ser iniciada (Status atual: ${this.status}).`);
        }
    }

    finalizar(): void {
        if (this.status === StatusEtapa.ANDAMENTO) {
            this.status = StatusEtapa.CONCLUIDA;
            console.log(`Etapa ${this.nome} concluída.`);
        } else {
            console.log(`Etapa ${this.nome} não pode ser finalizada (Status atual: ${this.status}).`);
        }
    }

    associarFuncionario(funcionario: Funcionario): void {
        // Evita duplicidade
        if (!this.funcionarios.find(f => f.id === funcionario.id)) {
            this.funcionarios.push(funcionario);
            console.log(`Funcionário ${funcionario.nome} associado à etapa ${this.nome}.`);
        } else {
            console.log(`Funcionário ${funcionario.nome} já está associado a esta etapa.`);
        }
    }

    listarFuncionarios(): Funcionario[] {
        console.log(`Funcionários na etapa ${this.nome}:`);
        this.funcionarios.forEach(f => console.log(`- ${f.nome} (ID: ${f.id})`));
        return this.funcionarios;
    }
}