import { AtualizarFuncionarioDTO, CriarFuncionarioDTO } from "./funcionario.entity";
import { FuncionarioService } from "./funcionario.service";

export class FuncionarioController {
    constructor(private readonly funcionarioService: FuncionarioService) {}

    async criar(dto: CriarFuncionarioDTO) {
        return this.funcionarioService.criar(dto);
    }

    async listar() {
        return this.funcionarioService.listar();
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
