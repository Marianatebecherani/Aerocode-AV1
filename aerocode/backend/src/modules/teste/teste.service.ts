import { AtualizarTesteDTO, CriarTesteDTO, Teste, TesteResponseDTO } from "./teste.entity";
import { TesteRepository } from "./teste.repository";

export class TesteService {
    constructor(private readonly testeRepository: TesteRepository) {}

    async criar(dto: CriarTesteDTO): Promise<TesteResponseDTO> {
        const teste = new Teste({
            id: await this.testeRepository.gerarProximoId(),
            tipo: dto.tipo,
            resultado: dto.resultado
        });

        const testeCriado = await this.testeRepository.criar(teste);
        return testeCriado.toResponse();
    }

    async listar(): Promise<TesteResponseDTO[]> {
        const testes = await this.testeRepository.listar();
        return testes.map((teste) => teste.toResponse());
    }

    async buscarPorId(id: string): Promise<TesteResponseDTO | null> {
        const teste = await this.testeRepository.buscarPorId(id);
        return teste ? teste.toResponse() : null;
    }

    async atualizar(id: string, dto: AtualizarTesteDTO): Promise<TesteResponseDTO | null> {
        const testeAtual = await this.testeRepository.buscarPorId(id);
        if (!testeAtual) {
            return null;
        }

        const testeAtualizado = new Teste({
            id: testeAtual.id,
            tipo: dto.tipo ?? testeAtual.tipo,
            resultado: dto.resultado ?? testeAtual.resultado
        });

        const resultado = await this.testeRepository.atualizar(id, testeAtualizado);
        return resultado ? resultado.toResponse() : null;
    }

    async deletar(id: string): Promise<boolean> {
        return this.testeRepository.deletar(id);
    }
}
