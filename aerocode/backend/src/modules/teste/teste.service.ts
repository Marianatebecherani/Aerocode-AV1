import {
    AtualizarTesteDTO,
    CriarTesteDTO,
    ListarTestesDTO,
    ListarTestesResponseDTO,
    Teste,
    TesteResponseDTO,
    TipoTeste
} from "./teste.entity";
import { ResultadoTeste } from "./teste-resultado";
import { TesteRepository } from "./teste.repository";

export class TesteService {
    constructor(private readonly testeRepository: TesteRepository) {}

    async criar(dto: CriarTesteDTO): Promise<TesteResponseDTO> {
        const teste = new Teste({
            id: await this.testeRepository.gerarProximoId(),
            tipo: dto.tipo,
            resultado: dto.resultado,
            aeronaveCodigo: dto.aeronaveCodigo
        });

        const testeCriado = await this.testeRepository.criar(teste);
        return testeCriado.toResponse();
    }

    async listar(filtros: ListarTestesDTO = {}): Promise<ListarTestesResponseDTO> {
        const aeronaveCodigo = this.normalizarAeronaveCodigoFiltro(filtros.aeronaveCodigo);
        const tipo = this.normalizarTipoFiltro(filtros.tipo);
        const resultado = this.normalizarResultadoFiltro(filtros.resultado);
        const page = this.normalizarInteiroPositivo(filtros.page, 1, "page");
        const limit = this.normalizarInteiroPositivo(filtros.limit, 10, "limit");

        const testes = await this.testeRepository.listar();
        const testesFiltrados = testes.filter((teste) => {
            const atendeAeronave = !aeronaveCodigo || teste.aeronaveCodigo === aeronaveCodigo;
            const atendeTipo = !tipo || teste.tipo === tipo;
            const atendeResultado = !resultado || teste.resultadoTracker.atual?.resultado === resultado;

            return atendeAeronave && atendeTipo && atendeResultado;
        });

        const total = testesFiltrados.length;
        const totalPages = Math.ceil(total / limit);
        const inicio = (page - 1) * limit;
        const dados = testesFiltrados.slice(inicio, inicio + limit).map((teste) => teste.toResponse());

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

    async buscarPorId(id: string): Promise<TesteResponseDTO | null> {
        const teste = await this.testeRepository.buscarPorId(id);
        return teste ? teste.toResponse() : null;
    }

    async atualizar(id: string, dto: AtualizarTesteDTO): Promise<TesteResponseDTO | null> {
        const testeAtual = await this.testeRepository.buscarPorId(id);
        if (!testeAtual) {
            return null;
        }

        const testeAtualizado = new Teste({
            id: testeAtual.id,
            tipo: dto.tipo ?? testeAtual.tipo,
            aeronaveCodigo: dto.aeronaveCodigo ?? testeAtual.aeronaveCodigo,
            resultadoTracker: testeAtual.resultadoTracker
        });

        const resultado = await this.testeRepository.atualizar(id, testeAtualizado);
        return resultado ? resultado.toResponse() : null;
    }

    async deletar(id: string): Promise<boolean> {
        return this.testeRepository.deletar(id);
    }

    async aprovar(id: string): Promise<TesteResponseDTO | null> {
        const teste = await this.testeRepository.buscarPorId(id);
        if (!teste) {
            return null;
        }

        teste.aprovar();
        const resultado = await this.testeRepository.atualizar(id, teste);
        return resultado ? resultado.toResponse() : null;
    }

    async reprovar(id: string): Promise<TesteResponseDTO | null> {
        const teste = await this.testeRepository.buscarPorId(id);
        if (!teste) {
            return null;
        }

        teste.reprovar();
        const resultado = await this.testeRepository.atualizar(id, teste);
        return resultado ? resultado.toResponse() : null;
    }

    private normalizarTipoFiltro(tipo?: string): TipoTeste | undefined {
        if (!tipo || tipo.trim().length === 0) {
            return undefined;
        }

        const tipoNormalizado = tipo.trim().toUpperCase() as TipoTeste;
        if (!Object.values(TipoTeste).includes(tipoNormalizado)) {
            throw new Error("Tipo do teste invalido.");
        }

        return tipoNormalizado;
    }

    private normalizarResultadoFiltro(resultado?: string): ResultadoTeste | undefined {
        if (!resultado || resultado.trim().length === 0) {
            return undefined;
        }

        const resultadoNormalizado = resultado.trim().toUpperCase() as ResultadoTeste;
        if (!Object.values(ResultadoTeste).includes(resultadoNormalizado)) {
            throw new Error("Resultado do teste invalido.");
        }

        return resultadoNormalizado;
    }

    private normalizarAeronaveCodigoFiltro(aeronaveCodigo?: string): string | undefined {
        if (!aeronaveCodigo || aeronaveCodigo.trim().length === 0) {
            return undefined;
        }

        return aeronaveCodigo.trim().toUpperCase();
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
