import { Aeronave, TipoAeronave } from "../aeronave/aeronave.entity";
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
    DashboardFiltrosDTO,
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

    async resumo(filtros: DashboardFiltrosDTO = {}): Promise<DashboardResumoResponseDTO> {
        const [aeronaves, etapas, pecas, testes, relatorios] = await Promise.all([
            this.aeronaves(filtros),
            this.etapas(filtros),
            this.pecas(filtros),
            this.testes(filtros),
            this.relatorios(filtros)
        ]);

        return {
            aeronaves,
            etapas,
            pecas,
            testes,
            relatorios
        };
    }

    async aeronaves(filtros: DashboardFiltrosDTO = {}): Promise<DashboardAeronavesResponseDTO> {
        const [todasAeronaves, etapas, pecas, testes] = await Promise.all([
            this.listarAeronavesFiltradas(filtros),
            this.etapaRepository.listar(),
            this.pecaRepository.listar(),
            this.testeRepository.listar()
        ]);

        const aeronavesFinalizadas = todasAeronaves.filter((aeronave) => {
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
            total: todasAeronaves.length,
            "em producao": todasAeronaves.length - aeronavesFinalizadas,
            finalizadas: aeronavesFinalizadas
        };
    }

    async etapas(filtros: DashboardFiltrosDTO = {}): Promise<DashboardEtapasResponseDTO> {
        const codigosAeronaves = await this.listarCodigosAeronavesFiltradas(filtros);
        const etapas = (await this.etapaRepository.listar()).filter((etapa) => codigosAeronaves.has(etapa.aeronaveCodigo));
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

    async pecas(filtros: DashboardFiltrosDTO = {}): Promise<DashboardPecasResponseDTO> {
        const codigosAeronaves = await this.listarCodigosAeronavesFiltradas(filtros);
        const pecas = (await this.pecaRepository.listar()).filter((peca) => codigosAeronaves.has(peca.aeronaveCodigo));
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

    async testes(filtros: DashboardFiltrosDTO = {}): Promise<DashboardTestesResponseDTO> {
        const codigosAeronaves = await this.listarCodigosAeronavesFiltradas(filtros);
        const testes = (await this.testeRepository.listar()).filter((teste) => codigosAeronaves.has(teste.aeronaveCodigo));
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

    async relatorios(filtros: DashboardFiltrosDTO = {}): Promise<DashboardRelatoriosResponseDTO> {
        const codigosAeronaves = await this.listarCodigosAeronavesFiltradas(filtros);
        const relatorios = (await this.relatorioRepository.listar()).filter((relatorio) =>
            codigosAeronaves.has(relatorio.aeronaveCodigo)
        );
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

    private async listarCodigosAeronavesFiltradas(filtros: DashboardFiltrosDTO): Promise<Set<string>> {
        const aeronaves = await this.listarAeronavesFiltradas(filtros);
        return new Set(aeronaves.map((aeronave) => aeronave.codigo));
    }

    private async listarAeronavesFiltradas(filtros: DashboardFiltrosDTO): Promise<Aeronave[]> {
        const codigo = this.normalizarCodigoFiltro(filtros.codigo);
        const modelo = filtros.modelo?.trim().toLowerCase();
        const tipo = this.normalizarTipoFiltro(filtros.tipo);
        const capacidadeMin = this.normalizarInteiroNaoNegativo(filtros.capacidadeMin, "capacidadeMin");
        const capacidadeMax = this.normalizarInteiroNaoNegativo(filtros.capacidadeMax, "capacidadeMax");
        const alcanceMin = this.normalizarInteiroNaoNegativo(filtros.alcanceMin, "alcanceMin");
        const alcanceMax = this.normalizarInteiroNaoNegativo(filtros.alcanceMax, "alcanceMax");

        if (capacidadeMin !== undefined && capacidadeMax !== undefined && capacidadeMin > capacidadeMax) {
            throw new Error("capacidadeMin deve ser menor ou igual a capacidadeMax.");
        }

        if (alcanceMin !== undefined && alcanceMax !== undefined && alcanceMin > alcanceMax) {
            throw new Error("alcanceMin deve ser menor ou igual a alcanceMax.");
        }

        const aeronaves = await this.aeronaveRepository.listar();
        return aeronaves.filter((aeronave) => {
            const atendeCodigo = !codigo || aeronave.codigo === codigo;
            const atendeModelo = !modelo || aeronave.modelo.toLowerCase().includes(modelo);
            const atendeTipo = !tipo || aeronave.tipo === tipo;
            const atendeCapacidadeMin = capacidadeMin === undefined || aeronave.capacidade >= capacidadeMin;
            const atendeCapacidadeMax = capacidadeMax === undefined || aeronave.capacidade <= capacidadeMax;
            const atendeAlcanceMin = alcanceMin === undefined || aeronave.alcance >= alcanceMin;
            const atendeAlcanceMax = alcanceMax === undefined || aeronave.alcance <= alcanceMax;

            return (
                atendeCodigo &&
                atendeModelo &&
                atendeTipo &&
                atendeCapacidadeMin &&
                atendeCapacidadeMax &&
                atendeAlcanceMin &&
                atendeAlcanceMax
            );
        });
    }

    private normalizarCodigoFiltro(codigo?: string): string | undefined {
        if (!codigo || codigo.trim().length === 0) {
            return undefined;
        }

        return codigo.trim().toUpperCase();
    }

    private normalizarTipoFiltro(tipo?: string): TipoAeronave | undefined {
        if (!tipo || tipo.trim().length === 0) {
            return undefined;
        }

        const tipoNormalizado = tipo.trim().toUpperCase() as TipoAeronave;
        if (!Object.values(TipoAeronave).includes(tipoNormalizado)) {
            throw new Error("Tipo da aeronave invalido.");
        }

        return tipoNormalizado;
    }

    private normalizarInteiroNaoNegativo(valor: string | undefined, campo: string): number | undefined {
        if (!valor || valor.trim().length === 0) {
            return undefined;
        }

        const numero = Number(valor);
        if (!Number.isInteger(numero) || numero < 0) {
            throw new Error(`Parametro ${campo} deve ser um numero inteiro positivo ou zero.`);
        }

        return numero;
    }
}
