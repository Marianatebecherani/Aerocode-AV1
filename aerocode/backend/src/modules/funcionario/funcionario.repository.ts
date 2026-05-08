import * as path from "path";
import { PersistenceManager } from "../../shared/persistence";
import { Funcionario, FuncionarioProps } from "./funcionario.entity";

export class FuncionarioRepository {
    private readonly persistence = new PersistenceManager<Funcionario>(
        path.join(__dirname, "../../data/funcionarios")
    );

    async criar(funcionario: Funcionario): Promise<Funcionario> {
        this.persistence.save(funcionario);
        return funcionario;
    }

    async listar(): Promise<Funcionario[]> {
        return this.persistence.loadAll((data) => this.hydrate(data));
    }

    async gerarProximoId(): Promise<string> {
        const funcionarios = await this.listar();
        const maiorId = funcionarios.reduce((maior, funcionario) => {
            const idNumerico = Number(funcionario.id);
            return Number.isInteger(idNumerico) && idNumerico > maior ? idNumerico : maior;
        }, 0);

        return String(maiorId + 1);
    }

    async buscarPorId(id: string): Promise<Funcionario | null> {
        const funcionarios = await this.listar();
        return funcionarios.find((funcionario) => funcionario.id === id.trim()) ?? null;
    }

    async buscarPorUsuario(usuario: string): Promise<Funcionario | null> {
        const funcionarios = await this.listar();
        return funcionarios.find(
            (funcionario) => this.normalizarChave(funcionario.usuario) === this.normalizarChave(usuario)
        ) ?? null;
    }

    async atualizar(id: string, funcionario: Funcionario): Promise<Funcionario | null> {
        const funcionarioExistente = await this.buscarPorId(id);
        if (!funcionarioExistente) {
            return null;
        }

        this.persistence.save(funcionario);
        return funcionario;
    }

    async deletar(id: string): Promise<boolean> {
        const funcionarioExistente = await this.buscarPorId(id);
        if (!funcionarioExistente) {
            return false;
        }

        this.persistence.delete(id);
        return true;
    }

    private hydrate(data: unknown): Funcionario {
        const props = data as FuncionarioProps;
        return new Funcionario(props);
    }

    private normalizarChave(valor: string): string {
        return valor.trim().toLowerCase();
    }
}
