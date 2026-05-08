import * as path from "path";
import { PersistenceManager } from "../../shared/persistence";
import { Relatorio, RelatorioProps } from "./relatorio.entity";

export class RelatorioRepository {
    private readonly persistence = new PersistenceManager<Relatorio>(
        path.join(__dirname, "../../data/relatorios")
    );

    async criar(relatorio: Relatorio): Promise<Relatorio> {
        this.persistence.save(relatorio, (data) => data.toPersistence());
        return relatorio;
    }

    async listar(): Promise<Relatorio[]> {
        return this.persistence.loadAll((data) => this.hydrate(data));
    }

    async gerarProximoId(): Promise<string> {
        const relatorios = await this.listar();
        const maiorId = relatorios.reduce((maior, relatorio) => {
            const idNumerico = Number(relatorio.id);
            return Number.isInteger(idNumerico) && idNumerico > maior ? idNumerico : maior;
        }, 0);

        return String(maiorId + 1);
    }

    async buscarPorId(id: string): Promise<Relatorio | null> {
        const relatorios = await this.listar();
        return relatorios.find((relatorio) => relatorio.id === id.trim()) ?? null;
    }

    async deletar(id: string): Promise<boolean> {
        const relatorioExistente = await this.buscarPorId(id);
        if (!relatorioExistente) {
            return false;
        }

        this.persistence.delete(id);
        return true;
    }

    private hydrate(data: unknown): Relatorio {
        const props = data as RelatorioProps;
        return new Relatorio(props);
    }
}
