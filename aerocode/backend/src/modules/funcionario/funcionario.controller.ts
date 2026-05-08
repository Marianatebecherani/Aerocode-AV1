import { AtualizarFuncionarioDTO, CriarFuncionarioDTO, ListarFuncionariosDTO } from "./funcionario.entity";
import { FuncionarioService } from "./funcionario.service";

export class FuncionarioController {
    constructor(private readonly funcionarioService: FuncionarioService) {}

    async criar(dto: CriarFuncionarioDTO) {
        return this.funcionarioService.criar(dto);
    }

    async listar(filtros: ListarFuncionariosDTO) {
        return this.funcionarioService.listar(filtros);
    }

    async buscarPorId(id: string) {
        return this.funcionarioService.buscarPorId(id);
    }

    async atualizar(id: string, dto: AtualizarFuncionarioDTO) {
        return this.funcionarioService.atualizar(id, dto);
    }

    async deletar(id: string) {
        return this.funcionarioService.deletar(id);
    }
}
