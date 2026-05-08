import * as path from "path";
import { PersistenceManager } from "../../shared/persistence";
import { Etapa, EtapaProps } from "./etapa.entity";

export class EtapaRepository {
    private readonly persistence = new PersistenceManager<Etapa>(
        path.join(__dirname, "../../data/etapas")
    );

    async criar(etapa: Etapa): Promise<Etapa> {
        this.persistence.save(etapa, (data) => data.toResponse());
        return etapa;
    }

    async listar(): Promise<Etapa[]> {
        return this.persistence.loadAll((data) => this.hydrate(data));
    }

    async gerarProximoId(): Promise<string> {
        const etapas = await this.listar();
        const maiorId = etapas.reduce((maior, etapa) => {
            const idNumerico = Number(etapa.id);
            return Number.isInteger(idNumerico) && idNumerico > maior ? idNumerico : maior;
        }, 0);

        return String(maiorId + 1);
    }

    async buscarPorId(id: string): Promise<Etapa | null> {
        const etapas = await this.listar();
        return etapas.find((etapa) => etapa.id === id.trim()) ?? null;
    }

    async buscarPorNome(nome: string): Promise<Etapa | null> {
        const etapas = await this.listar();
        return etapas.find((etapa) => this.normalizarChave(etapa.nome) === this.normalizarChave(nome)) ?? null;
    }

    async atualizar(id: string, etapa: Etapa): Promise<Etapa | null> {
        const etapaExistente = await this.buscarPorId(id);
        if (!etapaExistente) {
            return null;
        }

        this.persistence.save(etapa, (data) => data.toResponse());
        return etapa;
    }

    async deletar(id: string): Promise<boolean> {
        const etapaExistente = await this.buscarPorId(id);
        if (!etapaExistente) {
            return false;
        }

        this.persistence.delete(id);
        return true;
    }

    private hydrate(data: unknown): Etapa {
        const props = data as EtapaProps;
        return new Etapa(props);
    }

    private normalizarChave(nome: string): string {
        return nome.trim().toLowerCase();
    }
}
