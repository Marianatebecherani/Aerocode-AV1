import { AtualizarTesteDTO, CriarTesteDTO } from "./teste.entity";
import { TesteService } from "./teste.service";

export class TesteController {
    constructor(private readonly testeService: TesteService) {}

    async criar(dto: CriarTesteDTO) {
        return this.testeService.criar(dto);
    }

    async listar() {
        return this.testeService.listar();
    }

    async buscarPorId(id: string) {
        return this.testeService.buscarPorId(id);
    }

    async atualizar(id: string, dto: AtualizarTesteDTO) {
        return this.testeService.atualizar(id, dto);
    }

    async deletar(id: string) {
        return this.testeService.deletar(id);
    }
}
