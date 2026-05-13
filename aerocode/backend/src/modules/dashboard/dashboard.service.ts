import { AeronaveRepository } from "../aeronave/aeronave.repository";
import { EtapaRepository } from "../etapa/etapa.repository";
import { StatusEtapa } from "../etapa/etapa-status";
import { PecaRepository } from "../peca/peca.repository";
import { StatusPeca } from "../peca/peca-status";
import { RelatorioRepository } from "../relatorio/relatorio.repository";
import { StatusRelatorio } from "../relatorio/relatorio-status";
import { TesteRepository } from "../teste/teste.repository";
import { ResultadoTeste } from "../teste/teste-resultado";
import {
    DashboardAeronavesResponseDTO,
    DashboardEtapasResponseDTO,
    DashboardPecasResponseDTO,
    DashboardRelatoriosResponseDTO,
    DashboardResumoResponseDTO,
    DashboardTestesResponseDTO
} from "./dashboard.entity";

export class DashboardService {
    constructor(
        private readonly aeronaveRepository: AeronaveRepository,
        private readonly etapaRepository: EtapaRepository,
        private readonly pecaRepository: PecaRepository,
        private readonly testeRepository: TesteRepository,
        private readonly relatorioRepository: RelatorioRepository
    ) {}

    async resumo(): Promise<DashboardResumoResponseDTO> {
        const [aeronaves, etapas, pecas, testes, relatorios] = await Promise.all([
            this.aeronaves(),
            this.etapas(),
            this.pecas(),
            this.testes(),
            this.relatorios()
        ]);

        return {
            aeronaves,
            etapas,
            pecas,
            testes,
            relatorios
        };
    }

    async aeronaves(): Promise<DashboardAeronavesResponseDTO> {
        const [aeronaves, etapas, pecas, testes] = await Promise.all([
            this.aeronaveRepository.listar(),
            this.etapaRepository.listar(),
            this.pecaRepository.listar(),
            this.testeRepository.listar()
        ]);

        const aeronavesFinalizadas = aeronaves.filter((aeronave) => {
            const etapasDaAeronave = etapas.filter((etapa) => etapa.aeronaveCodigo === aeronave.codigo);
            const pecasDaAeronave = pecas.filter((peca) => peca.aeronaveCodigo === aeronave.codigo);
            const testesDaAeronave = testes.filter((teste) => teste.aeronaveCodigo === aeronave.codigo);

            return (
                etapasDaAeronave.length > 0 &&
                etapasDaAeronave.every((etapa) => etapa.statusTracker.atual?.status === StatusEtapa.CONCLUIDA) &&
                pecasDaAeronave.length > 0 &&
                pecasDaAeronave.every((peca) => peca.statusTracker.atual?.status === StatusPeca.PRONTA) &&
                testesDaAeronave.length > 0 &&
                testesDaAeronave.every((teste) => teste.resultadoTracker.atual?.resultado === ResultadoTeste.APROVADO)
            );
        }).length;

        return {
            total: aeronaves.length,
            "em producao": aeronaves.length - aeronavesFinalizadas,
            finalizadas: aeronavesFinalizadas
        };
    }

    async etapas(): Promise<DashboardEtapasResponseDTO> {
        const etapas = await this.etapaRepository.listar();
        const etapasPendentes = etapas.filter((etapa) => etapa.statusTracker.atual?.status === StatusEtapa.PENDENTE).length;
        const etapasEmAndamento = etapas.filter(
            (etapa) => etapa.statusTracker.atual?.status === StatusEtapa.EM_ANDAMENTO
        ).length;
        const etapasConcluidas = etapas.filter(
            (etapa) => etapa.statusTracker.atual?.status === StatusEtapa.CONCLUIDA
        ).length;

        return {
            total: etapas.length,
            pendentes: etapasPendentes,
            "em andamento": etapasEmAndamento,
            concluidas: etapasConcluidas
        };
    }

    async pecas(): Promise<DashboardPecasResponseDTO> {
        const pecas = await this.pecaRepository.listar();
        const pecasEmProducao = pecas.filter((peca) => peca.statusTracker.atual?.status === StatusPeca.EM_PRODUCAO).length;
        const pecasEmTransporte = pecas.filter(
            (peca) => peca.statusTracker.atual?.status === StatusPeca.EM_TRANSPORTE
        ).length;
        const pecasProntas = pecas.filter((peca) => peca.statusTracker.atual?.status === StatusPeca.PRONTA).length;

        return {
            total: pecas.length,
            "em producao": pecasEmProducao,
            "em transporte": pecasEmTransporte,
            prontas: pecasProntas
        };
    }

    async testes(): Promise<DashboardTestesResponseDTO> {
        const testes = await this.testeRepository.listar();
        const testesReprovados = testes.filter(
            (teste) => teste.resultadoTracker.atual?.resultado === ResultadoTeste.REPROVADO
        ).length;
        const testesAprovados = testes.filter(
            (teste) => teste.resultadoTracker.atual?.resultado === ResultadoTeste.APROVADO
        ).length;

        return {
            total: testes.length,
            reprovados: testesReprovados,
            aprovados: testesAprovados
        };
    }

    async relatorios(): Promise<DashboardRelatoriosResponseDTO> {
        const relatorios = await this.relatorioRepository.listar();
        const relatoriosEmProducao = relatorios.filter(
            (relatorio) => relatorio.status === StatusRelatorio.EM_PRODUCAO
        ).length;
        const relatoriosFinalizados = relatorios.filter(
            (relatorio) => relatorio.status === StatusRelatorio.FINALIZADA
        ).length;

        return {
            total: relatorios.length,
            "em producao": relatoriosEmProducao,
            finalizadas: relatoriosFinalizados
        };
    }
}
