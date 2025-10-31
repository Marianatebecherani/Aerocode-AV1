import * as fs from 'fs';
import * as path from 'path';

/**
 * Uma classe genérica para gerenciar a persistência de dados em arquivos JSON.
 * Lida com a criação de diretórios, salvamento e carregamento de coleções de objetos.
 * @template T O tipo de objeto a ser gerenciado. Deve ter uma propriedade 'id' ou 'codigo'.
 */
export class PersistenceManager<T extends { id: string } | { codigo: string }> {
    private dataDir: string;

    constructor(dataDir: string) {
        this.dataDir = dataDir;
    }

    /**
     * Obtém o identificador único do item (seja 'id' ou 'codigo').
     */
    private getIdentifier(item: T): string {
        if ('id' in item) return item.id;
        if ('codigo' in item) return item.codigo;
        throw new Error("O item a ser salvo não possui uma propriedade 'id' ou 'codigo'.");
    }

    /**
     * Salva um único item em um arquivo JSON.
     * @param item
     * @param preSaveTransform Uma função opcional para transformar o objeto antes de salvá-lo.
     */
    save(item: T, preSaveTransform?: (data: T) => any): void {
        const id = this.getIdentifier(item);
        const filePath = path.join(this.dataDir, `${id}.json`);
        
        const dataToSave = preSaveTransform ? preSaveTransform(item) : item;
        
        const jsonData = JSON.stringify(dataToSave, null, 2);
        fs.writeFileSync(filePath, jsonData, 'utf-8');
    }

    /**
     * Carrega todos os itens de um diretório.
     * @param postLoadHydration
     */
    loadAll(postLoadHydration: (obj: any) => T): T[] {
        const items: T[] = [];
        if (!fs.existsSync(this.dataDir)) return items;

        const files = fs.readdirSync(this.dataDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const data = fs.readFileSync(path.join(this.dataDir, file), 'utf-8');
                items.push(postLoadHydration(JSON.parse(data)));
            }
        }
        return items;
    }
}