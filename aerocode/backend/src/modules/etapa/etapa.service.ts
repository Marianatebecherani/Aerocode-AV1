import {
    AtualizarEtapaDTO,
    CriarEtapaDTO,
    Etapa,
    EtapaResponseDTO,
    ListarEtapasDTO,
    ListarEtapasResponseDTO
} from "./etapa.entity";
import { StatusEtapa } from "./etapa-status";
import { EtapaRepository } from "./etapa.repository";
import { FuncionarioRepository } from "../funcionario/funcionario.repository";

export class EtapaService {
    constructor(
        private readonly etapaRepository: EtapaRepository,
        private readonly funcionarioRepository: FuncionarioRepository
    ) {}

    async criar(dto: CriarEtapaDTO): Promise<EtapaResponseDTO> {
        const etapaExistente = await this.etapaRepository.buscarPorNome(dto.nome);
        if (etapaExistente) {
            throw new Error("Ja existe uma etapa com esse nome.");
        }

        const etapa = new Etapa({
            id: await this.etapaRepository.gerarProximoId(),
            nome: dto.nome,
            prazoConclusao: dto.prazoConclusao,
            prioridade: dto.prioridade,
            aeronaveCodigo: dto.aeronaveCodigo,
            ...(dto.funcionariosIds ? { funcionariosIds: dto.funcionariosIds } : {})
        });

        const etapaCriada = await this.etapaRepository.criar(etapa);
        return etapaCriada.toResponse();
    }

    async listar(filtros: ListarEtapasDTO = {}): Promise<ListarEtapasResponseDTO> {
        const aeronaveCodigo = this.normalizarAeronaveCodigoFiltro(filtros.aeronaveCodigo);
        const nome = filtros.nome?.trim().toLowerCase();
        const status = this.normalizarStatusFiltro(filtros.status);
        const prazoInicio = this.normalizarDataFiltro(filtros.prazoInicio, "prazoInicio");
        const prazoFim = this.normalizarDataFiltro(filtros.prazoFim, "prazoFim");
        const page = this.normalizarInteiroPositivo(filtros.page, 1, "page");
        const limit = this.normalizarInteiroPositivo(filtros.limit, 10, "limit");

        if (prazoInicio && prazoFim && prazoInicio.getTime() > prazoFim.getTime()) {
            throw new Error("prazoInicio deve ser menor ou igual a prazoFim.");
        }

        const etapas = await this.etapaRepository.listar();
        const etapasFiltradas = etapas.filter((etapa) => {
            const prazoConclusao = new Date(etapa.prazoConclusao);
            const atendeAeronave = !aeronaveCodigo || etapa.aeronaveCodigo === aeronaveCodigo;
            const atendeNome = !nome || etapa.nome.toLowerCase().includes(nome);
            const atendeStatus = !status || etapa.statusTracker.atual?.status === status;
            const atendePrazoInicio = !prazoInicio || prazoConclusao.getTime() >= prazoInicio.getTime();
            const atendePrazoFim = !prazoFim || prazoConclusao.getTime() <= prazoFim.getTime();

            return atendeAeronave && atendeNome && atendeStatus && atendePrazoInicio && atendePrazoFim;
        });

        const total = etapasFiltradas.length;
        const totalPages = Math.ceil(total / limit);
        const inicio = (page - 1) * limit;
        const dados = etapasFiltradas.slice(inicio, inicio + limit).map((etapa) => etapa.toResponse());

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

    async buscarPorId(id: string): Promise<EtapaResponseDTO | null> {
        const etapa = await this.etapaRepository.buscarPorId(id);
        return etapa ? etapa.toResponse() : null;
    }

    async atualizar(id: string, dto: AtualizarEtapaDTO): Promise<EtapaResponseDTO | null> {
        const etapaAtual = await this.etapaRepository.buscarPorId(id);
        if (!etapaAtual) {
            return null;
        }

        const etapaAtualizada = new Etapa({
            id: etapaAtual.id,
            nome: dto.nome ?? etapaAtual.nome,
            prazoConclusao: dto.prazoConclusao ?? etapaAtual.prazoConclusao,
            prioridade: dto.prioridade ?? etapaAtual.prioridade,
            aeronaveCodigo: dto.aeronaveCodigo ?? etapaAtual.aeronaveCodigo,
            funcionariosIds: dto.funcionariosIds ?? etapaAtual.funcionariosIds,
            statusTracker: etapaAtual.statusTracker
        });

        const resultado = await this.etapaRepository.atualizar(id, etapaAtualizada);
        return resultado ? resultado.toResponse() : null;
    }

    async deletar(id: string): Promise<boolean> {
        return this.etapaRepository.deletar(id);
    }

    async prosseguirStatus(id: string): Promise<EtapaResponseDTO | null> {
        const etapa = await this.etapaRepository.buscarPorId(id);
        if (!etapa) {
            return null;
        }

        etapa.prosseguirStatus();
        const resultado = await this.etapaRepository.atualizar(id, etapa);
        return resultado ? resultado.toResponse() : null;
    }

    async retrocederStatus(id: string): Promise<EtapaResponseDTO | null> {
        const etapa = await this.etapaRepository.buscarPorId(id);
        if (!etapa) {
            return null;
        }

        etapa.retrocederStatus();
        const resultado = await this.etapaRepository.atualizar(id, etapa);
        return resultado ? resultado.toResponse() : null;
    }

    async iniciar(id: string): Promise<EtapaResponseDTO | null> {
        const etapa = await this.etapaRepository.buscarPorId(id);
        if (!etapa) {
            return null;
        }

        etapa.iniciar();
        const resultado = await this.etapaRepository.atualizar(id, etapa);
        return resultado ? resultado.toResponse() : null;
    }

    async finalizar(id: string): Promise<EtapaResponseDTO | null> {
        const etapa = await this.etapaRepository.buscarPorId(id);
        if (!etapa) {
            return null;
        }

        etapa.finalizar();
        const resultado = await this.etapaRepository.atualizar(id, etapa);
        return resultado ? resultado.toResponse() : null;
    }

    async associarFuncionario(id: string, funcionarioId: string): Promise<EtapaResponseDTO | null> {
        const etapa = await this.etapaRepository.buscarPorId(id);
        if (!etapa) {
            return null;
        }

        const funcionario = await this.funcionarioRepository.buscarPorId(funcionarioId);
        if (!funcionario) {
            throw new Error("Funcionario nao encontrado.");
        }

        etapa.associarFuncionario(funcionario.id);
        const resultado = await this.etapaRepository.atualizar(id, etapa);
        return resultado ? resultado.toResponse() : null;
    }

    async desassociarFuncionario(id: string, funcionarioId: string): Promise<EtapaResponseDTO | null> {
        const etapa = await this.etapaRepository.buscarPorId(id);
        if (!etapa) {
            return null;
        }

        etapa.desassociarFuncionario(funcionarioId);
        const resultado = await this.etapaRepository.atualizar(id, etapa);
        return resultado ? resultado.toResponse() : null;
    }

    private normalizarStatusFiltro(status?: string): StatusEtapa | undefined {
        if (!status || status.trim().length === 0) {
            return undefined;
        }

        const statusNormalizado = status.trim().toUpperCase() as StatusEtapa;
        if (!Object.values(StatusEtapa).includes(statusNormalizado)) {
            throw new Error("Status da etapa invalido.");
        }

        return statusNormalizado;
    }

    private normalizarAeronaveCodigoFiltro(aeronaveCodigo?: string): string | undefined {
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
