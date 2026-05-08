import * as path from "path";
import { PersistenceManager } from "../../shared/persistence";
import { Peca, PecaProps } from "./peca.entity";

export class PecaRepository {
    private readonly persistence = new PersistenceManager<Peca>(
        path.join(__dirname, "../../data/pecas")
    );

    async criar(peca: Peca): Promise<Peca> {
        this.persistence.save(peca, (data) => data.toResponse());
        return peca;
    }

    async listar(): Promise<Peca[]> {
        return this.persistence.loadAll((data) => this.hydrate(data));
    }

    async gerarProximoId(): Promise<string> {
        const pecas = await this.listar();
        const maiorId = pecas.reduce((maior, peca) => {
            const idNumerico = Number(peca.id);
            return Number.isInteger(idNumerico) && idNumerico > maior ? idNumerico : maior;
        }, 0);

        return String(maiorId + 1);
    }

    async buscarPorId(id: string): Promise<Peca | null> {
        const pecas = await this.listar();
        return pecas.find((peca) => peca.id === id.trim()) ?? null;
    }

    async buscarPorNome(nome: string): Promise<Peca | null> {
        const pecas = await this.listar();
        return pecas.find((peca) => this.normalizarChave(peca.nome) === this.normalizarChave(nome)) ?? null;
    }

    async atualizar(id: string, peca: Peca): Promise<Peca | null> {
        const pecaExistente = await this.buscarPorId(id);
        if (!pecaExistente) {
            return null;
        }

        this.persistence.save(peca, (data) => data.toResponse());
        return peca;
    }

    async deletar(id: string): Promise<boolean> {
        const pecaExistente = await this.buscarPorId(id);
        if (!pecaExistente) {
            return false;
        }

        this.persistence.delete(id);
        return true;
    }

    private hydrate(data: unknown): Peca {
        const props = data as PecaProps;
        return new Peca(props);
    }

    private normalizarChave(nome: string): string {
        return nome.trim().toLowerCase();
    }
}
