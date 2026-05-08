import { AtualizarAeronaveDTO, CriarAeronaveDTO, ListarAeronavesDTO } from "./aeronave.entity";
import { AeronaveService } from "./aeronave.service";

export class AeronaveController {
    constructor(private readonly aeronaveService: AeronaveService) {}

    async criar(dto: CriarAeronaveDTO) {
        return this.aeronaveService.criar(dto);
    }

    async listar(filtros: ListarAeronavesDTO) {
        return this.aeronaveService.listar(filtros);
    }

    async buscarPorCodigo(codigo: string) {
        return this.aeronaveService.buscarPorCodigo(codigo);
    }

    async buscarDetalhesPorCodigo(codigo: string) {
        return this.aeronaveService.buscarDetalhesPorCodigo(codigo);
    }

    async atualizar(codigo: string, dto: AtualizarAeronaveDTO) {
        return this.aeronaveService.atualizar(codigo, dto);
    }

    async deletar(codigo: string) {
        return this.aeronaveService.deletar(codigo);
    }
}
