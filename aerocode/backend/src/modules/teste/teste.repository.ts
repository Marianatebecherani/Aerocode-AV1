import * as path from "path";
import { PersistenceManager } from "../../shared/persistence";
import { Teste, TesteProps } from "./teste.entity";

export class TesteRepository {
    private readonly persistence = new PersistenceManager<Teste>(
        path.join(__dirname, "../../data/testes")
    );

    async criar(teste: Teste): Promise<Teste> {
        this.persistence.save(teste, (data) => data.toResponse());
        return teste;
    }

    async listar(): Promise<Teste[]> {
        return this.persistence.loadAll((data) => this.hydrate(data));
    }

    async gerarProximoId(): Promise<string> {
        const testes = await this.listar();
        const maiorId = testes.reduce((maior, teste) => {
            const idNumerico = Number(teste.id);
            return Number.isInteger(idNumerico) && idNumerico > maior ? idNumerico : maior;
        }, 0);

        return String(maiorId + 1);
    }

    async buscarPorId(id: string): Promise<Teste | null> {
        const testes = await this.listar();
        return testes.find((teste) => teste.id === id.trim()) ?? null;
    }

    async atualizar(id: string, teste: Teste): Promise<Teste | null> {
        const testeExistente = await this.buscarPorId(id);
        if (!testeExistente) {
            return null;
        }

        this.persistence.save(teste, (data) => data.toResponse());
        return teste;
    }

    async deletar(id: string): Promise<boolean> {
        const testeExistente = await this.buscarPorId(id);
        if (!testeExistente) {
            return false;
        }

        this.persistence.delete(id);
        return true;
    }

    private hydrate(data: unknown): Teste {
        const props = data as TesteProps;
        return new Teste(props);
    }
}
