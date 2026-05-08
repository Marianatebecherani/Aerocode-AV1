import { AtualizarEtapaDTO, CriarEtapaDTO, Etapa, EtapaResponseDTO } from "./etapa.entity";
import { EtapaRepository } from "./etapa.repository";

export class EtapaService {
    constructor(private readonly etapaRepository: EtapaRepository) {}

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
            aeronaveId: dto.aeronaveId,
            ...(dto.funcionariosIds ? { funcionariosIds: dto.funcionariosIds } : {})
        });

        const etapaCriada = await this.etapaRepository.criar(etapa);
        return etapaCriada.toResponse();
    }

    async listar(): Promise<EtapaResponseDTO[]> {
        const etapas = await this.etapaRepository.listar();
        return etapas.map((etapa) => etapa.toResponse());
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
            aeronaveId: dto.aeronaveId ?? etapaAtual.aeronaveId,
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
}
