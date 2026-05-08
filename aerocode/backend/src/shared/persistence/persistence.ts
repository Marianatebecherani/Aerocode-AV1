import * as fs from "fs";
import * as path from "path";

type PersistableItem = { id: string } | { codigo: string } | { nome: string };

export class PersistenceManager<T extends PersistableItem> {
    private dataDir: string;

    constructor(dataDir: string) {
        this.dataDir = dataDir;
    }

    save(item: T, preSaveTransform?: (data: T) => unknown): void {
        this.ensureDataDir();

        const id = this.sanitizeFileName(this.getIdentifier(item));
        const filePath = path.join(this.dataDir, `${id}.json`);
        const dataToSave = preSaveTransform ? preSaveTransform(item) : item;
        const jsonData = JSON.stringify(dataToSave, null, 2);

        fs.writeFileSync(filePath, jsonData, "utf-8");
    }

    loadAll(postLoadHydration: (obj: unknown) => T): T[] {
        const items: T[] = [];
        if (!fs.existsSync(this.dataDir)) return items;

        const files = fs.readdirSync(this.dataDir);
        for (const file of files) {
            if (file.endsWith(".json")) {
                const data = fs.readFileSync(path.join(this.dataDir, file), "utf-8");
                items.push(postLoadHydration(JSON.parse(data)));
            }
        }

        return items;
    }

    delete(identifier: string): void {
        const filePath = path.join(this.dataDir, `${this.sanitizeFileName(identifier)}.json`);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    private getIdentifier(item: T): string {
        if ("id" in item) return item.id;
        if ("codigo" in item) return item.codigo;
        if ("nome" in item) return item.nome;

        throw new Error("O item a ser salvo nao possui uma propriedade 'id', 'codigo' ou 'nome'.");
    }

    private ensureDataDir(): void {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    private sanitizeFileName(value: string): string {
        return value.trim().replace(/[<>:"/\\|?*]/g, "-");
    }
}
