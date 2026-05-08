import { CriarRelatorioDTO, ListarRelatoriosDTO } from "./relatorio.entity";
import { RelatorioService } from "./relatorio.service";

export class RelatorioController {
    constructor(private readonly relatorioService: RelatorioService) {}

    async criar(dto: CriarRelatorioDTO) {
        return this.relatorioService.criar(dto);
    }

    async listar(filtros: ListarRelatoriosDTO) {
        return this.relatorioService.listar(filtros);
    }

    async buscarPorId(id: string) {
        return this.relatorioService.buscarPorId(id);
    }

    async deletar(id: string) {
        return this.relatorioService.deletar(id);
    }
}
