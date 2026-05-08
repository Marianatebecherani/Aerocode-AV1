import * as path from "path";
import { PersistenceManager } from "../../shared/persistence";
import { Aeronave, AeronaveProps } from "./aeronave.entity";

export class AeronaveRepository {
    private readonly persistence = new PersistenceManager<Aeronave>(
        path.join(__dirname, "../../data/aeronaves")
    );

    async criar(aeronave: Aeronave): Promise<Aeronave> {
        this.persistence.save(aeronave, (data) => data.toPersistence());
        return aeronave;
    }

    async listar(): Promise<Aeronave[]> {
        return this.persistence.loadAll((data) => this.hydrate(data));
    }

    async gerarProximoCodigo(): Promise<string> {
        const aeronaves = await this.listar();
        const maiorCodigo = aeronaves.reduce((maior, aeronave) => {
            const match = aeronave.codigo.match(/^AER-(\d{4})$/);
            if (!match) {
                return maior;
            }

            const codigoNumerico = Number(match[1]);
            return codigoNumerico > maior ? codigoNumerico : maior;
        }, 0);

        return `AER-${String(maiorCodigo + 1).padStart(4, "0")}`;
    }

    async buscarPorCodigo(codigo: string): Promise<Aeronave | null> {
        const aeronaves = await this.listar();
        return aeronaves.find((aeronave) => aeronave.codigo === codigo.trim()) ?? null;
    }

    async atualizar(codigo: string, aeronave: Aeronave): Promise<Aeronave | null> {
        const aeronaveExistente = await this.buscarPorCodigo(codigo);
        if (!aeronaveExistente) {
            return null;
        }

        this.persistence.save(aeronave, (data) => data.toPersistence());
        return aeronave;
    }

    async deletar(codigo: string): Promise<boolean> {
        const aeronaveExistente = await this.buscarPorCodigo(codigo);
        if (!aeronaveExistente) {
            return false;
        }

        this.persistence.delete(codigo);
        return true;
    }

    private hydrate(data: unknown): Aeronave {
        const props = data as AeronaveProps;
        return new Aeronave(props);
    }
}
