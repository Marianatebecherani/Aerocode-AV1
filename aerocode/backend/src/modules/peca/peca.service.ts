import {
    AtualizarPecaDTO,
    CriarPecaDTO,
    ListarPecasDTO,
    ListarPecasResponseDTO,
    Peca,
    PecaResponseDTO,
    TipoPeca
} from "./peca.entity";
import { StatusPeca } from "./peca-status";
import { PecaRepository } from "./peca.repository";

export class PecaService {
    constructor(private readonly pecaRepository: PecaRepository) {}

    async criar(dto: CriarPecaDTO): Promise<PecaResponseDTO> {
        const pecaExistente = await this.pecaRepository.buscarPorNome(dto.nome);
        if (pecaExistente) {
            throw new Error("Ja existe uma peca com esse nome.");
        }

        const peca = new Peca({
            id: await this.pecaRepository.gerarProximoId(),
            nome: dto.nome,
            tipo: dto.tipo,
            fornecedor: dto.fornecedor
        });
        const pecaCriada = await this.pecaRepository.criar(peca);
        return pecaCriada.toResponse();
    }

    async listar(filtros: ListarPecasDTO = {}): Promise<ListarPecasResponseDTO> {
        const tipo = this.normalizarTipoFiltro(filtros.tipo);
        const status = this.normalizarStatusFiltro(filtros.status);
        const termo = filtros.termo?.trim().toLowerCase();
        const page = this.normalizarInteiroPositivo(filtros.page, 1, "page");
        const limit = this.normalizarInteiroPositivo(filtros.limit, 10, "limit");

        const pecas = await this.pecaRepository.listar();
        const pecasFiltradas = pecas.filter((peca) => {
            const atendeTipo = !tipo || peca.tipo === tipo;
            const atendeStatus = !status || peca.statusTracker.atual?.status === status;
            const atendeTermo =
                !termo ||
                peca.nome.toLowerCase().includes(termo) ||
                peca.fornecedor.toLowerCase().includes(termo);

            return atendeTipo && atendeStatus && atendeTermo;
        });

        const total = pecasFiltradas.length;
        const totalPages = Math.ceil(total / limit);
        const inicio = (page - 1) * limit;
        const dados = pecasFiltradas.slice(inicio, inicio + limit).map((peca) => peca.toResponse());

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

    async buscarPorId(id: string): Promise<PecaResponseDTO | null> {
        const peca = await this.pecaRepository.buscarPorId(id);
        return peca ? peca.toResponse() : null;
    }

    async atualizar(id: string, dto: AtualizarPecaDTO): Promise<PecaResponseDTO | null> {
        const pecaAtual = await this.pecaRepository.buscarPorId(id);
        if (!pecaAtual) {
            return null;
        }

        const pecaAtualizada = new Peca({
            id: pecaAtual.id,
            nome: dto.nome ?? pecaAtual.nome,
            tipo: dto.tipo ?? pecaAtual.tipo,
            fornecedor: dto.fornecedor ?? pecaAtual.fornecedor,
            statusTracker: pecaAtual.statusTracker
        });

        const resultado = await this.pecaRepository.atualizar(id, pecaAtualizada);
        return resultado ? resultado.toResponse() : null;
    }

    async deletar(id: string): Promise<boolean> {
        return this.pecaRepository.deletar(id);
    }

    async prosseguirStatus(id: string): Promise<PecaResponseDTO | null> {
        const peca = await this.pecaRepository.buscarPorId(id);
        if (!peca) {
            return null;
        }

        peca.prosseguirStatus();
        const resultado = await this.pecaRepository.atualizar(id, peca);
        return resultado ? resultado.toResponse() : null;
    }

    async retrocederStatus(id: string): Promise<PecaResponseDTO | null> {
        const peca = await this.pecaRepository.buscarPorId(id);
        if (!peca) {
            return null;
        }

        peca.retrocederStatus();
        const resultado = await this.pecaRepository.atualizar(id, peca);
        return resultado ? resultado.toResponse() : null;
    }

    private normalizarTipoFiltro(tipo?: string): TipoPeca | undefined {
        if (!tipo || tipo.trim().length === 0) {
            return undefined;
        }

        const tipoNormalizado = tipo.trim().toUpperCase() as TipoPeca;
        if (!Object.values(TipoPeca).includes(tipoNormalizado)) {
            throw new Error("Tipo da peca invalido.");
        }

        return tipoNormalizado;
    }

    private normalizarStatusFiltro(status?: string): StatusPeca | undefined {
        if (!status || status.trim().length === 0) {
            return undefined;
        }

        const statusNormalizado = status.trim().toUpperCase() as StatusPeca;
        if (!Object.values(StatusPeca).includes(statusNormalizado)) {
            throw new Error("Status da peca invalido.");
        }

        return statusNormalizado;
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
