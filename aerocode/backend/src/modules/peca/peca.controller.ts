import { AtualizarPecaDTO, CriarPecaDTO, ListarPecasDTO } from "./peca.entity";
import { PecaService } from "./peca.service";

export class PecaController {
    constructor(private readonly pecaService: PecaService) {}

    async criar(dto: CriarPecaDTO) {
        return this.pecaService.criar(dto);
    }

    async listar(filtros: ListarPecasDTO) {
        return this.pecaService.listar(filtros);
    }

    async buscarPorId(id: string) {
        return this.pecaService.buscarPorId(id);
    }

    async atualizar(id: string, dto: AtualizarPecaDTO) {
        return this.pecaService.atualizar(id, dto);
    }

    async deletar(id: string) {
        return this.pecaService.deletar(id);
    }

    async prosseguirStatus(id: string) {
        return this.pecaService.prosseguirStatus(id);
    }

    async retrocederStatus(id: string) {
        return this.pecaService.retrocederStatus(id);
    }
}
