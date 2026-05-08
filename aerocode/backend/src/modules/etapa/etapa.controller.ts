import { AtualizarEtapaDTO, CriarEtapaDTO, ListarEtapasDTO } from "./etapa.entity";
import { EtapaService } from "./etapa.service";

export class EtapaController {
    constructor(private readonly etapaService: EtapaService) {}

    async criar(dto: CriarEtapaDTO) {
        return this.etapaService.criar(dto);
    }

    async listar(filtros: ListarEtapasDTO) {
        return this.etapaService.listar(filtros);
    }

    async buscarPorId(id: string) {
        return this.etapaService.buscarPorId(id);
    }

    async atualizar(id: string, dto: AtualizarEtapaDTO) {
        return this.etapaService.atualizar(id, dto);
    }

    async deletar(id: string) {
        return this.etapaService.deletar(id);
    }

    async prosseguirStatus(id: string) {
        return this.etapaService.prosseguirStatus(id);
    }

    async retrocederStatus(id: string) {
        return this.etapaService.retrocederStatus(id);
    }

    async iniciar(id: string) {
        return this.etapaService.iniciar(id);
    }

    async finalizar(id: string) {
        return this.etapaService.finalizar(id);
    }

    async associarFuncionario(id: string, funcionarioId: string) {
        return this.etapaService.associarFuncionario(id, funcionarioId);
    }

    async desassociarFuncionario(id: string, funcionarioId: string) {
        return this.etapaService.desassociarFuncionario(id, funcionarioId);
    }
}
