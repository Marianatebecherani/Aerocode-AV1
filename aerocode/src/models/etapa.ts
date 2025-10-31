import { StatusEtapa } from "../enums";
import { Funcionario } from "./funcionario";
import { Aeronave } from "./aeronave";

export class Etapa {
    ordem: number;
    nome: string;
    prazo: string; // Ex: "10 dias"
    status: StatusEtapa;
    funcionarios: Funcionario[]; // Relação de associação

    constructor(nome: string, prazo: string, ordem: number) {
        this.nome = nome;
        this.prazo = prazo;
        this.ordem = ordem;
        this.status = StatusEtapa.PENDENTE;
        this.funcionarios = [];
    }

    iniciar(aeronave: Aeronave): void {
        if (this.status !== StatusEtapa.PENDENTE) {
            console.log(`Etapa ${this.nome} não pode ser iniciada (Status atual: ${this.status}).`);
            return;
        }

        // A primeira etapa (ordem 1) pode começar a qualquer momento.
        if (this.ordem > 1) {
            const etapaAnterior = aeronave.etapas.find(e => e.ordem === this.ordem - 1);
            
            if (!etapaAnterior || etapaAnterior.status !== StatusEtapa.CONCLUIDA) {
                console.log(`Erro: A etapa anterior ('${etapaAnterior?.nome || 'N/A'}') precisa ser concluída antes de iniciar a etapa '${this.nome}'.`);
                return;
            }
        }

        this.status = StatusEtapa.ANDAMENTO;
        console.log(`Etapa ${this.nome} (Ordem: ${this.ordem}) iniciada.`);
    }

    finalizar(): void {
        if (this.status === StatusEtapa.ANDAMENTO) {
            this.status = StatusEtapa.CONCLUIDA;
            console.log(`Etapa ${this.nome} (Ordem: ${this.ordem}) concluída.`);
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

    desassociarFuncionario(funcionario: Funcionario): void {
        const index = this.funcionarios.findIndex(f => f.id === funcionario.id);
        if (index !== -1) {
            this.funcionarios.splice(index, 1);
            console.log(`Funcionário ${funcionario.nome} desassociado da etapa ${this.nome}.`);
        } else {
            console.log(`Erro: Funcionário ${funcionario.nome} não está associado a esta etapa.`);
        }
    }

    listarFuncionarios(): Funcionario[] {
        console.log(`\n--- Funcionários na Etapa: ${this.nome} ---`);
        if (this.funcionarios.length === 0) {
            console.log("Nenhum funcionário associado a esta etapa.");
        }
        this.funcionarios.forEach(f => console.log(`- ${f.nome} (ID: ${f.id}, Nível: ${f.nivelPermissao})`));
        return this.funcionarios;
    }
}