import { Aeronave } from "./aeronave";
import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.join(__dirname, '../../data/relatorios');

export class Relatorio {
    private conteudo: string = "";
    private aeronaveCodigo: string = "";
    private cliente: string = "";
    private dataEntrega: string = "";

    /**
     * Gera o conteúdo do relatório e o armazena internamente.
     */
    gerarRelatorio(aeronave: Aeronave, cliente: string, dataEntrega: string): void {
        this.aeronaveCodigo = aeronave.codigo;
        this.cliente = cliente;
        this.dataEntrega = dataEntrega;

        let rel = "=================================================\n";
        rel += "      RELATÓRIO FINAL DE PRODUÇÃO - AEROCODE     \n";
        rel += "=================================================\n\n";
        
        rel += `Cliente: ${this.cliente}\n`;
        rel += `Data de Entrega: ${this.dataEntrega}\n\n`;
        
        rel += "--- 1. Detalhes da Aeronave ---\n";
        rel += `Código: ${aeronave.codigo}\n`;
        rel += `Modelo: ${aeronave.modelo}\n`;
        rel += `Tipo: ${aeronave.tipo}\n`;
        rel += `Capacidade: ${aeronave.capacidade} passageiros\n`;
        rel += `Alcance: ${aeronave.alcance} km\n\n`;

        rel += "--- 2. Peças Utilizadas ---\n";
        if (aeronave.pecas.length === 0) {
            rel += "Nenhuma peça registrada.\n";
        } else {
            aeronave.pecas.forEach(p => {
                rel += `- Peça: ${p.nome} (Fornecedor: ${p.fornecedor}, Tipo: ${p.tipo}, Status: ${p.status})\n`;
            });
        }
        rel += "\n";

        rel += "--- 3. Etapas de Produção Realizadas ---\n";
        if (aeronave.etapas.length === 0) {
            rel += "Nenhuma etapa registrada.\n";
        } else {
            aeronave.etapas.forEach(e => {
                rel += `- Etapa: ${e.nome} (Prazo: ${e.prazo}, Status: ${e.status})\n`;
                const funcionarios = e.listarFuncionarios().map(f => f.nome).join(', ') || "Nenhum";
                rel += `  (Funcionários: ${funcionarios})\n`;
            });
        }
        rel += "\n";

        rel += "--- 4. Resultados dos Testes ---\n";
         if (aeronave.testes.length === 0) {
            rel += "Nenhum teste registrado.\n";
        } else {
            aeronave.testes.forEach(t => {
                rel += `- Teste: ${t.tipo} (Resultado: ${t.resultado})\n`;
            });
        }
        rel += "\n";
        rel += "=================================================\n";
        rel += "            Fim do Relatório\n";
        rel += "=================================================\n";

        this.conteudo = rel;
        console.log("Relatório gerado com sucesso.");
    }

    /**
     * Salva o relatório (previamente gerado) em um arquivo de texto.
     */
    salvarEmArquivo(): void {
        if (!this.conteudo) {
            console.error("Erro: Nenhum relatório foi gerado. Chame gerarRelatorio() primeiro.");
            return;
        }

        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const fileName = `Relatorio_Aeronave_${this.aeronaveCodigo}.txt`;
        const filePath = path.join(dataDir, fileName);

        fs.writeFileSync(filePath, this.conteudo, 'utf-8');
        console.log(`Relatório salvo com sucesso em: ${filePath}`);
    }
}