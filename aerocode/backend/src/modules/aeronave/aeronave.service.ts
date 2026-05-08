import { EtapaRepository } from "../etapa/etapa.repository";
import { PecaRepository } from "../peca/peca.repository";
import { TesteRepository } from "../teste/teste.repository";
import {
    Aeronave,
    AeronaveResponseDTO,
    AtualizarAeronaveDTO,
    CriarAeronaveDTO
} from "./aeronave.entity";
import { AeronaveRepository } from "./aeronave.repository";

export class AeronaveService {
    constructor(
        private readonly aeronaveRepository: AeronaveRepository,
        private readonly pecaRepository: PecaRepository,
        private readonly etapaRepository: EtapaRepository,
        private readonly testeRepository: TesteRepository
    ) {}

    async criar(dto: CriarAeronaveDTO): Promise<AeronaveResponseDTO> {
        const aeronave = new Aeronave({
            codigo: await this.aeronaveRepository.gerarProximoCodigo(),
            modelo: dto.modelo,
            tipo: dto.tipo,
            capacidade: dto.capacidade,
            alcance: dto.alcance
        });
        const aeronaveCriada = await this.aeronaveRepository.criar(aeronave);
        return this.toResponse(aeronaveCriada);
    }

    async listar(): Promise<AeronaveResponseDTO[]> {
        const aeronaves = await this.aeronaveRepository.listar();
        return Promise.all(aeronaves.map((aeronave) => this.toResponse(aeronave)));
    }

    async buscarPorCodigo(codigo: string): Promise<AeronaveResponseDTO | null> {
        const aeronave = await this.aeronaveRepository.buscarPorCodigo(codigo);
        return aeronave ? this.toResponse(aeronave) : null;
    }

    async atualizar(codigo: string, dto: AtualizarAeronaveDTO): Promise<AeronaveResponseDTO | null> {
        const aeronaveAtual = await this.aeronaveRepository.buscarPorCodigo(codigo);
        if (!aeronaveAtual) {
            return null;
        }

        const aeronaveAtualizada = new Aeronave({
            codigo: aeronaveAtual.codigo,
            modelo: dto.modelo ?? aeronaveAtual.modelo,
            tipo: dto.tipo ?? aeronaveAtual.tipo,
            capacidade: dto.capacidade ?? aeronaveAtual.capacidade,
            alcance: dto.alcance ?? aeronaveAtual.alcance
        });

        const resultado = await this.aeronaveRepository.atualizar(codigo, aeronaveAtualizada);
        return resultado ? this.toResponse(resultado) : null;
    }

    async deletar(codigo: string): Promise<boolean> {
        return this.aeronaveRepository.deletar(codigo);
    }

    private async toResponse(aeronave: Aeronave): Promise<AeronaveResponseDTO> {
        const [pecas, etapas, testes] = await Promise.all([
            this.pecaRepository.listar(),
            this.etapaRepository.listar(),
            this.testeRepository.listar()
        ]);

        return aeronave.toResponse({
            pecas: pecas
                .filter((peca) => peca.aeronaveCodigo === aeronave.codigo)
                .map((peca) => peca.toResponse()),
            etapas: etapas
                .filter((etapa) => etapa.aeronaveCodigo === aeronave.codigo)
                .map((etapa) => etapa.toResponse()),
            testes: testes
                .filter((teste) => teste.aeronaveCodigo === aeronave.codigo)
                .map((teste) => teste.toResponse())
        });
    }
}
