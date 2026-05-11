import { AeronaveService } from "../aeronave";
import {
    CriarRelatorioDTO,
    ListarRelatoriosDTO,
    ListarRelatoriosResponseDTO,
    Relatorio,
    RelatorioResponseDTO
} from "./relatorio.entity";
import { RelatorioRepository } from "./relatorio.repository";

export class RelatorioService {
    constructor(
        private readonly relatorioRepository: RelatorioRepository,
        private readonly aeronaveService: AeronaveService
    ) {}

    async criar(dto: CriarRelatorioDTO): Promise<RelatorioResponseDTO> {
        const aeronaveCodigo = this.normalizarAeronaveCodigo(dto.aeronaveCodigo);
        if (!aeronaveCodigo) {
            throw new Error("Codigo da aeronave e obrigatorio para gerar o relatorio.");
        }

        const detalhes = await this.aeronaveService.buscarDetalhesPorCodigo(aeronaveCodigo);
        if (!detalhes) {
            throw new Error("Aeronave nao encontrada.");
        }

        const relatorio = new Relatorio({
            id: await this.relatorioRepository.gerarProximoId(),
            aeronaveCodigo,
            dataEmissao: new Date().toISOString(),
            detalhes
        });

        const relatorioCriado = await this.relatorioRepository.criar(relatorio);
        return relatorioCriado.toResponse();
    }

    async listar(filtros: ListarRelatoriosDTO = {}): Promise<ListarRelatoriosResponseDTO> {
        const dataInicio = this.normalizarDataFiltro(filtros.dataInicio, "dataInicio");
        const dataFim = this.normalizarDataFiltro(filtros.dataFim, "dataFim");
        const page = this.normalizarInteiroPositivo(filtros.page, 1, "page");
        const limit = this.normalizarInteiroPositivo(filtros.limit, 10, "limit");

        if (dataInicio && dataFim && dataInicio.getTime() > dataFim.getTime()) {
            throw new Error("dataInicio deve ser menor ou igual a dataFim.");
        }

        const relatorios = await this.relatorioRepository.listar();
        const relatoriosFiltrados = relatorios.filter((relatorio) => {
            const dataEmissao = new Date(relatorio.dataEmissao);
            const atendeDataInicio = !dataInicio || dataEmissao.getTime() >= dataInicio.getTime();
            const atendeDataFim = !dataFim || dataEmissao.getTime() <= dataFim.getTime();

            return atendeDataInicio && atendeDataFim;
        });

        const total = relatoriosFiltrados.length;
        const totalPages = Math.ceil(total / limit);
        const inicio = (page - 1) * limit;
        const dados = relatoriosFiltrados
            .slice(inicio, inicio + limit)
            .map((relatorio) => relatorio.toResponse());

        return {
            dados,
            paginacao: {
                total,
                page,
                limit,
                totalPages
            }
        };
    }

    async buscarPorId(id: string): Promise<RelatorioResponseDTO | null> {
        const relatorio = await this.relatorioRepository.buscarPorId(id);
        return relatorio ? relatorio.toResponse() : null;
    }

    async deletar(id: string): Promise<boolean> {
        return this.relatorioRepository.deletar(id);
    }

    private normalizarAeronaveCodigo(aeronaveCodigo?: string): string | undefined {
        if (!aeronaveCodigo || aeronaveCodigo.trim().length === 0) {
            return undefined;
        }

        return aeronaveCodigo.trim().toUpperCase();
    }

    private normalizarDataFiltro(valor: string | undefined, campo: string): Date | undefined {
        if (!valor || valor.trim().length === 0) {
            return undefined;
        }

        const data = new Date(valor.trim());
        if (Number.isNaN(data.getTime())) {
            throw new Error(`Parametro ${campo} deve ser uma data valida.`);
        }

        return data;
    }

    private normalizarInteiroPositivo(valor: string | undefined, padrao: number, campo: string): number {
        if (!valor || valor.trim().length === 0) {
            return padrao;
        }

        const numero = Number(valor);
        if (!Number.isInteger(numero) || numero < 1) {
            throw new Error(`Parametro ${campo} deve ser um numero inteiro positivo.`);
        }

        return numero;
    }
}
