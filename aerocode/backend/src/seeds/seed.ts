import * as bcrypt from "bcrypt";
import { AeronaveService } from "../modules/aeronave/aeronave.service";
import { Aeronave } from "../modules/aeronave/aeronave.entity";
import { AeronaveRepository } from "../modules/aeronave/aeronave.repository";
import { Etapa } from "../modules/etapa/etapa.entity";
import { EtapaRepository } from "../modules/etapa/etapa.repository";
import { Funcionario } from "../modules/funcionario/funcionario.entity";
import { FuncionarioRepository } from "../modules/funcionario/funcionario.repository";
import { Peca } from "../modules/peca/peca.entity";
import { PecaRepository } from "../modules/peca/peca.repository";
import { Relatorio } from "../modules/relatorio/relatorio.entity";
import { RelatorioRepository } from "../modules/relatorio/relatorio.repository";
import { determinarStatusRelatorio } from "../modules/relatorio/relatorio-status";
import { Teste } from "../modules/teste/teste.entity";
import { TesteRepository } from "../modules/teste/teste.repository";
import { aeronaves, etapas, funcionarios, pecas, testes } from "./seed-data";

async function popularAeronaves(): Promise<number> {
    const repository = new AeronaveRepository();

    for (const aeronave of aeronaves) {
        await repository.criar(new Aeronave(aeronave));
    }

    return aeronaves.length;
}

async function popularFuncionarios(): Promise<number> {
    const repository = new FuncionarioRepository();

    for (const funcionario of funcionarios) {
        const senhaCriptografada = await bcrypt.hash(funcionario.senha, 10);

        await repository.criar(
            new Funcionario({
                ...funcionario,
                senha: senhaCriptografada
            })
        );
    }

    return funcionarios.length;
}

async function popularPecas(): Promise<number> {
    const repository = new PecaRepository();

    for (const peca of pecas) {
        await repository.criar(new Peca(peca));
    }

    return pecas.length;
}

async function popularEtapas(): Promise<number> {
    const repository = new EtapaRepository();

    for (const etapa of etapas) {
        await repository.criar(new Etapa(etapa));
    }

    return etapas.length;
}

async function popularTestes(): Promise<number> {
    const repository = new TesteRepository();

    for (const teste of testes) {
        await repository.criar(new Teste(teste));
    }

    return testes.length;
}

async function popularRelatorios(): Promise<number> {
    const aeronaveRepository = new AeronaveRepository();
    const pecaRepository = new PecaRepository();
    const etapaRepository = new EtapaRepository();
    const testeRepository = new TesteRepository();
    const funcionarioRepository = new FuncionarioRepository();
    const relatorioRepository = new RelatorioRepository();
    const aeronaveService = new AeronaveService(
        aeronaveRepository,
        pecaRepository,
        etapaRepository,
        testeRepository,
        funcionarioRepository
    );

    for (const [index, aeronave] of aeronaves.entries()) {
        const detalhes = await aeronaveService.buscarDetalhesPorCodigo(aeronave.codigo);
        if (!detalhes) {
            throw new Error(`Aeronave ${aeronave.codigo} nao encontrada ao gerar relatorio.`);
        }

        await relatorioRepository.criar(
            new Relatorio({
                id: String(index + 1),
                aeronaveCodigo: aeronave.codigo,
                dataEmissao: new Date().toISOString(),
                status: determinarStatusRelatorio(detalhes),
                detalhes
            })
        );
    }

    return aeronaves.length;
}

async function executarSeed(): Promise<void> {
    const totalAeronaves = await popularAeronaves();
    const totalFuncionarios = await popularFuncionarios();
    const totalPecas = await popularPecas();
    const totalEtapas = await popularEtapas();
    const totalTestes = await popularTestes();
    const totalRelatorios = await popularRelatorios();

    console.log("Seed executado com sucesso.");
    console.log(`Aeronaves: ${totalAeronaves}`);
    console.log(`Funcionarios: ${totalFuncionarios}`);
    console.log(`Pecas: ${totalPecas}`);
    console.log(`Etapas: ${totalEtapas}`);
    console.log(`Testes: ${totalTestes}`);
    console.log(`Relatorios: ${totalRelatorios}`);
}

executarSeed().catch((error) => {
    const message = error instanceof Error ? error.message : "Erro desconhecido ao executar seed.";
    console.error(`Erro ao executar seed: ${message}`);
    process.exit(1);
});
