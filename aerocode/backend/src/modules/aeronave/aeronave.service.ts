import { EtapaRepository } from "../etapa/etapa.repository";
import { FuncionarioRepository } from "../funcionario/funcionario.repository";
import { PecaRepository } from "../peca/peca.repository";
import { TesteRepository } from "../teste/teste.repository";
import {
    Aeronave,
    AeronaveDetalhesResponseDTO,
    AeronaveResponseDTO,
    AtualizarAeronaveDTO,
    CriarAeronaveDTO,
    ListarAeronavesDTO,
    ListarAeronavesResponseDTO,
    TipoAeronave
} from "./aeronave.entity";
import { AeronaveRepository } from "./aeronave.repository";

export class AeronaveService {
    constructor(
        private readonly aeronaveRepository: AeronaveRepository,
        private readonly pecaRepository: PecaRepository,
        private readonly etapaRepository: EtapaRepository,
        private readonly testeRepository: TesteRepository,
        private readonly funcionarioRepository: FuncionarioRepository
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

    async listar(filtros: ListarAeronavesDTO = {}): Promise<ListarAeronavesResponseDTO> {
        const modelo = filtros.modelo?.trim().toLowerCase();
        const tipo = this.normalizarTipoFiltro(filtros.tipo);
        const capacidadeMin = this.normalizarInteiroNaoNegativo(filtros.capacidadeMin, "capacidadeMin");
        const capacidadeMax = this.normalizarInteiroNaoNegativo(filtros.capacidadeMax, "capacidadeMax");
        const alcanceMin = this.normalizarInteiroNaoNegativo(filtros.alcanceMin, "alcanceMin");
        const alcanceMax = this.normalizarInteiroNaoNegativo(filtros.alcanceMax, "alcanceMax");
        const page = this.normalizarInteiroPositivo(filtros.page, 1, "page");
        const limit = this.normalizarInteiroPositivo(filtros.limit, 10, "limit");

        if (capacidadeMin !== undefined && capacidadeMax !== undefined && capacidadeMin > capacidadeMax) {
            throw new Error("capacidadeMin deve ser menor ou igual a capacidadeMax.");
        }

        if (alcanceMin !== undefined && alcanceMax !== undefined && alcanceMin > alcanceMax) {
            throw new Error("alcanceMin deve ser menor ou igual a alcanceMax.");
        }

        const aeronaves = await this.aeronaveRepository.listar();
        const aeronavesFiltradas = aeronaves.filter((aeronave) => {
            const atendeModelo = !modelo || aeronave.modelo.toLowerCase().includes(modelo);
            const atendeTipo = !tipo || aeronave.tipo === tipo;
            const atendeCapacidadeMin = capacidadeMin === undefined || aeronave.capacidade >= capacidadeMin;
            const atendeCapacidadeMax = capacidadeMax === undefined || aeronave.capacidade <= capacidadeMax;
            const atendeAlcanceMin = alcanceMin === undefined || aeronave.alcance >= alcanceMin;
            const atendeAlcanceMax = alcanceMax === undefined || aeronave.alcance <= alcanceMax;

            return (
                atendeModelo &&
                atendeTipo &&
                atendeCapacidadeMin &&
                atendeCapacidadeMax &&
                atendeAlcanceMin &&
                atendeAlcanceMax
            );
        });

        const total = aeronavesFiltradas.length;
        const totalPages = Math.ceil(total / limit);
        const inicio = (page - 1) * limit;
        const dados = await Promise.all(
            aeronavesFiltradas.slice(inicio, inicio + limit).map((aeronave) => this.toResponse(aeronave))
        );

        return {
            dados,
            paginacao: {
                total,
                page,
                limit,
                totalPages
            }
        };
    }

    async buscarPorCodigo(codigo: string): Promise<AeronaveResponseDTO | null> {
        const aeronave = await this.aeronaveRepository.buscarPorCodigo(codigo);
        return aeronave ? this.toResponse(aeronave) : null;
    }

    async buscarDetalhesPorCodigo(codigo: string): Promise<AeronaveDetalhesResponseDTO | null> {
        const aeronave = await this.aeronaveRepository.buscarPorCodigo(codigo);
        if (!aeronave) {
            return null;
        }

        const [pecas, etapas, testes, funcionarios] = await Promise.all([
            this.pecaRepository.listar(),
            this.etapaRepository.listar(),
            this.testeRepository.listar(),
            this.funcionarioRepository.listar()
        ]);

        const funcionariosPorId = new Map(funcionarios.map((funcionario) => [funcionario.id, funcionario]));

        return {
            codigo: aeronave.codigo,
            modelo: aeronave.modelo,
            tipo: aeronave.tipo,
            capacidade: aeronave.capacidade,
            alcance: aeronave.alcance,
            etapas: etapas
                .filter((etapa) => etapa.aeronaveCodigo === aeronave.codigo)
                .map((etapa) => ({
                    nome: etapa.nome,
                    prazoConclusao: this.formatarData(etapa.prazoConclusao),
                    prioridade: etapa.prioridade,
                    status: etapa.statusTracker.atual?.status ?? null,
                    data: this.formatarDataHora(etapa.statusTracker.atual?.data),
                    funcionarios: etapa.funcionariosIds
                        .map((funcionarioId) => funcionariosPorId.get(funcionarioId))
                        .filter((funcionario) => funcionario !== undefined)
                        .map((funcionario) => ({
                            nome: funcionario.nome,
                            funcao: funcionario.nivelPermissao
                        }))
                })),
            pecas: pecas
                .filter((peca) => peca.aeronaveCodigo === aeronave.codigo)
                .map((peca) => ({
                    nome: peca.nome,
                    tipo: peca.tipo,
                    fornecedor: peca.fornecedor,
                    status: peca.statusTracker.atual?.status ?? null,
                    data: this.formatarDataHora(peca.statusTracker.atual?.data)
                })),
            testes: testes
                .filter((teste) => teste.aeronaveCodigo === aeronave.codigo)
                .map((teste) => ({
                    tipo: teste.tipo,
                    resultado: teste.resultadoTracker.atual?.resultado ?? null,
                    data: this.formatarDataHora(teste.resultadoTracker.atual?.data)
                }))
        };
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

    private formatarData(data: string): string {
        return new Date(data).toISOString().slice(0, 10);
    }

    private formatarDataHora(data?: Date | string): string | null {
        if (!data) {
            return null;
        }

        return new Date(data).toISOString();
    }

    private normalizarTipoFiltro(tipo?: string): TipoAeronave | undefined {
        if (!tipo || tipo.trim().length === 0) {
            return undefined;
        }

        const tipoNormalizado = tipo.trim().toUpperCase() as TipoAeronave;
        if (!Object.values(TipoAeronave).includes(tipoNormalizado)) {
            throw new Error("Tipo da aeronave invalido.");
        }

        return tipoNormalizado;
    }

    private normalizarInteiroNaoNegativo(valor: string | undefined, campo: string): number | undefined {
        if (!valor || valor.trim().length === 0) {
            return undefined;
        }

        const numero = Number(valor);
        if (!Number.isInteger(numero) || numero < 0) {
            throw new Error(`Parametro ${campo} deve ser um numero inteiro positivo ou zero.`);
        }

        return numero;
    }

    private normalizarInteiroPositivo(valor: string | undefined, padrao: number, campo: string): number {
        if (!valor || valor.trim().length === 0) {
            return padrao;
        }

        const numero = Number(valor);
        if (!Number.isInteger(numero) || numero < 1) {
            throw new Error(`Parametro ${campo} deve ser um numero inteiro positivo.`);
        }

        return numero;
    }
}
