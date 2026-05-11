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
        const etapaExistente = await this.etapaRepository.buscarPorNomeEAeronave(dto.nome, dto.aeronaveCodigo);
        if (etapaExistente) {
            throw new Error("Ja existe uma etapa com esse nome para esta aeronave.");
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
        return this.toResponseComOrdem(etapaCriada);
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
        const ordemExecucaoPorEtapa = this.criarMapaOrdemExecucao(etapas);
        const etapasFiltradas = etapas.filter((etapa) => {
            const prazoConclusao = new Date(etapa.prazoConclusao);
            const atendeAeronave = !aeronaveCodigo || etapa.aeronaveCodigo === aeronaveCodigo;
            const atendeNome = !nome || etapa.nome.toLowerCase().includes(nome);
            const atendeStatus = !status || etapa.statusTracker.atual?.status === status;
            const atendePrazoInicio = !prazoInicio || prazoConclusao.getTime() >= prazoInicio.getTime();
            const atendePrazoFim = !prazoFim || prazoConclusao.getTime() <= prazoFim.getTime();

            return atendeAeronave && atendeNome && atendeStatus && atendePrazoInicio && atendePrazoFim;
        }).sort((a, b) => this.compararOrdemResposta(a, b));

        const total = etapasFiltradas.length;
        const totalPages = Math.ceil(total / limit);
        const inicio = (page - 1) * limit;
        const dados = etapasFiltradas
            .slice(inicio, inicio + limit)
            .map((etapa) => etapa.toResponse(ordemExecucaoPorEtapa.get(etapa.id)));

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
        return etapa ? this.toResponseComOrdem(etapa) : null;
    }

    async atualizar(id: string, dto: AtualizarEtapaDTO): Promise<EtapaResponseDTO | null> {
        const etapaAtual = await this.etapaRepository.buscarPorId(id);
        if (!etapaAtual) {
            return null;
        }

        const nomeAtualizado = dto.nome ?? etapaAtual.nome;
        const aeronaveCodigoAtualizado = dto.aeronaveCodigo ?? etapaAtual.aeronaveCodigo;
        const etapaExistente = await this.etapaRepository.buscarPorNomeEAeronave(
            nomeAtualizado,
            aeronaveCodigoAtualizado,
            etapaAtual.id
        );
        if (etapaExistente) {
            throw new Error("Ja existe uma etapa com esse nome para esta aeronave.");
        }

        const etapaAtualizada = new Etapa({
            id: etapaAtual.id,
            nome: nomeAtualizado,
            prazoConclusao: dto.prazoConclusao ?? etapaAtual.prazoConclusao,
            prioridade: dto.prioridade ?? etapaAtual.prioridade,
            aeronaveCodigo: aeronaveCodigoAtualizado,
            funcionariosIds: dto.funcionariosIds ?? etapaAtual.funcionariosIds,
            statusTracker: etapaAtual.statusTracker
        });

        const resultado = await this.etapaRepository.atualizar(id, etapaAtualizada);
        return resultado ? this.toResponseComOrdem(resultado) : null;
    }

    async deletar(id: string): Promise<boolean> {
        return this.etapaRepository.deletar(id);
    }

    async prosseguirStatus(id: string): Promise<EtapaResponseDTO | null> {
        const etapa = await this.etapaRepository.buscarPorId(id);
        if (!etapa) {
            return null;
        }

        const proximoStatus = this.obterProximoStatus(etapa);
        if (proximoStatus) {
            await this.validarSequenciaStatus(etapa, proximoStatus);
        }

        etapa.prosseguirStatus();
        const resultado = await this.etapaRepository.atualizar(id, etapa);
        return resultado ? this.toResponseComOrdem(resultado) : null;
    }

    async retrocederStatus(id: string): Promise<EtapaResponseDTO | null> {
        const etapa = await this.etapaRepository.buscarPorId(id);
        if (!etapa) {
            return null;
        }

        const statusAnterior = this.obterStatusAnterior(etapa);
        if (statusAnterior) {
            await this.validarSequenciaStatus(etapa, statusAnterior);
        }

        etapa.retrocederStatus();
        const resultado = await this.etapaRepository.atualizar(id, etapa);
        return resultado ? this.toResponseComOrdem(resultado) : null;
    }

    async iniciar(id: string): Promise<EtapaResponseDTO | null> {
        const etapa = await this.etapaRepository.buscarPorId(id);
        if (!etapa) {
            return null;
        }

        await this.validarSequenciaStatus(etapa, StatusEtapa.EM_ANDAMENTO);
        etapa.iniciar();
        const resultado = await this.etapaRepository.atualizar(id, etapa);
        return resultado ? this.toResponseComOrdem(resultado) : null;
    }

    async finalizar(id: string): Promise<EtapaResponseDTO | null> {
        const etapa = await this.etapaRepository.buscarPorId(id);
        if (!etapa) {
            return null;
        }

        await this.validarSequenciaStatus(etapa, StatusEtapa.CONCLUIDA);
        etapa.finalizar();
        const resultado = await this.etapaRepository.atualizar(id, etapa);
        return resultado ? this.toResponseComOrdem(resultado) : null;
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
        return resultado ? this.toResponseComOrdem(resultado) : null;
    }

    async desassociarFuncionario(id: string, funcionarioId: string): Promise<EtapaResponseDTO | null> {
        const etapa = await this.etapaRepository.buscarPorId(id);
        if (!etapa) {
            return null;
        }

        etapa.desassociarFuncionario(funcionarioId);
        const resultado = await this.etapaRepository.atualizar(id, etapa);
        return resultado ? this.toResponseComOrdem(resultado) : null;
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

    private async validarSequenciaStatus(etapaAlterada: Etapa, novoStatus: StatusEtapa): Promise<void> {
        const etapas = (await this.etapaRepository.listar())
            .filter((etapa) => etapa.aeronaveCodigo === etapaAlterada.aeronaveCodigo)
            .sort((a, b) => this.compararOrdemExecucao(a, b));

        const statusPorEtapa = new Map(
            etapas.map((etapa) => [etapa.id, etapa.statusTracker.atual?.status ?? StatusEtapa.PENDENTE])
        );
        statusPorEtapa.set(etapaAlterada.id, novoStatus);

        for (const [indice, etapa] of etapas.entries()) {
            const status = statusPorEtapa.get(etapa.id) ?? StatusEtapa.PENDENTE;

            if (status === StatusEtapa.PENDENTE) {
                continue;
            }

            const etapaAnteriorNaoConcluida = etapas
                .slice(0, indice)
                .find((anterior) => statusPorEtapa.get(anterior.id) !== StatusEtapa.CONCLUIDA);

            if (etapaAnteriorNaoConcluida) {
                throw new Error(
                    `A etapa "${etapa.nome}" so pode sair de PENDENTE quando a etapa anterior "${etapaAnteriorNaoConcluida.nome}" estiver concluida.`
                );
            }
        }
    }

    private compararOrdemExecucao(a: Etapa, b: Etapa): number {
        const prazoA = new Date(a.prazoConclusao).getTime();
        const prazoB = new Date(b.prazoConclusao).getTime();

        if (prazoA !== prazoB) {
            return prazoA - prazoB;
        }

        if (a.prioridade !== b.prioridade) {
            return a.prioridade - b.prioridade;
        }

        return a.id.localeCompare(b.id, undefined, { numeric: true });
    }

    private compararOrdemResposta(a: Etapa, b: Etapa): number {
        if (a.aeronaveCodigo !== b.aeronaveCodigo) {
            return a.aeronaveCodigo.localeCompare(b.aeronaveCodigo);
        }

        return this.compararOrdemExecucao(a, b);
    }

    private criarMapaOrdemExecucao(etapas: Etapa[]): Map<string, number> {
        const etapasPorAeronave = new Map<string, Etapa[]>();

        for (const etapa of etapas) {
            const etapasDaAeronave = etapasPorAeronave.get(etapa.aeronaveCodigo) ?? [];
            etapasDaAeronave.push(etapa);
            etapasPorAeronave.set(etapa.aeronaveCodigo, etapasDaAeronave);
        }

        const ordemExecucaoPorEtapa = new Map<string, number>();
        for (const etapasDaAeronave of etapasPorAeronave.values()) {
            etapasDaAeronave
                .sort((a, b) => this.compararOrdemExecucao(a, b))
                .forEach((etapa, indice) => ordemExecucaoPorEtapa.set(etapa.id, indice + 1));
        }

        return ordemExecucaoPorEtapa;
    }

    private async toResponseComOrdem(etapa: Etapa): Promise<EtapaResponseDTO> {
        const etapas = await this.etapaRepository.listar();
        const ordemExecucaoPorEtapa = this.criarMapaOrdemExecucao(etapas);

        return etapa.toResponse(ordemExecucaoPorEtapa.get(etapa.id));
    }

    private obterProximoStatus(etapa: Etapa): StatusEtapa | null {
        const statusAtual = etapa.statusTracker.atual?.status ?? StatusEtapa.PENDENTE;

        if (statusAtual === StatusEtapa.PENDENTE) {
            return StatusEtapa.EM_ANDAMENTO;
        }

        if (statusAtual === StatusEtapa.EM_ANDAMENTO) {
            return StatusEtapa.CONCLUIDA;
        }

        return null;
    }

    private obterStatusAnterior(etapa: Etapa): StatusEtapa | null {
        const statusAtual = etapa.statusTracker.atual?.status ?? StatusEtapa.PENDENTE;

        if (statusAtual === StatusEtapa.CONCLUIDA) {
            return StatusEtapa.EM_ANDAMENTO;
        }

        if (statusAtual === StatusEtapa.EM_ANDAMENTO) {
            return StatusEtapa.PENDENTE;
        }

        return null;
    }
}
