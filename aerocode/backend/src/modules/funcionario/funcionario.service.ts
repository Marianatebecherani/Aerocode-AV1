import * as bcrypt from "bcrypt";
import {
    AtualizarFuncionarioDTO,
    CriarFuncionarioDTO,
    Funcionario,
    FuncionarioResponseDTO,
    ListarFuncionariosDTO,
    ListarFuncionariosResponseDTO,
    NivelPermissao
} from "./funcionario.entity";
import { FuncionarioRepository } from "./funcionario.repository";

export class FuncionarioService {
    constructor(private readonly funcionarioRepository: FuncionarioRepository) {}

    async criar(dto: CriarFuncionarioDTO): Promise<FuncionarioResponseDTO> {
        const funcionarioExistente = await this.funcionarioRepository.buscarPorUsuario(dto.usuario);
        if (funcionarioExistente) {
            throw new Error("Ja existe um funcionario com esse usuario.");
        }

        const funcionario = new Funcionario({
            id: await this.funcionarioRepository.gerarProximoId(),
            nome: dto.nome,
            telefone: dto.telefone,
            endereco: dto.endereco,
            usuario: dto.usuario,
            senha: await this.hashSenha(dto.senha),
            nivelPermissao: dto.nivelPermissao
        });

        const funcionarioCriado = await this.funcionarioRepository.criar(funcionario);
        return funcionarioCriado.toResponse();
    }

    async listar(filtros: ListarFuncionariosDTO = {}): Promise<ListarFuncionariosResponseDTO> {
        const termo = filtros.termo?.trim().toLowerCase();
        const nivelPermissao = this.normalizarNivelPermissaoFiltro(filtros.nivelPermissao);
        const page = this.normalizarInteiroPositivo(filtros.page, 1, "page");
        const limit = this.normalizarInteiroPositivo(filtros.limit, 10, "limit");

        const funcionarios = await this.funcionarioRepository.listar();
        const funcionariosFiltrados = funcionarios.filter((funcionario) => {
            const atendeTermo =
                !termo ||
                funcionario.nome.toLowerCase().includes(termo) ||
                funcionario.usuario.toLowerCase().includes(termo);
            const atendeNivel = !nivelPermissao || funcionario.nivelPermissao === nivelPermissao;

            return atendeTermo && atendeNivel;
        });

        const total = funcionariosFiltrados.length;
        const totalPages = Math.ceil(total / limit);
        const inicio = (page - 1) * limit;
        const dados = funcionariosFiltrados.slice(inicio, inicio + limit).map((funcionario) => funcionario.toResponse());

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

    async buscarPorId(id: string): Promise<FuncionarioResponseDTO | null> {
        const funcionario = await this.funcionarioRepository.buscarPorId(id);
        return funcionario ? funcionario.toResponse() : null;
    }

    async atualizar(id: string, dto: AtualizarFuncionarioDTO): Promise<FuncionarioResponseDTO | null> {
        const funcionarioAtual = await this.funcionarioRepository.buscarPorId(id);
        if (!funcionarioAtual) {
            return null;
        }

        if (dto.usuario && dto.usuario.trim() !== funcionarioAtual.usuario) {
            const usuarioExistente = await this.funcionarioRepository.buscarPorUsuario(dto.usuario);
            if (usuarioExistente) {
                throw new Error("Ja existe um funcionario com esse usuario.");
            }
        }

        const funcionarioAtualizado = new Funcionario({
            id: funcionarioAtual.id,
            nome: dto.nome ?? funcionarioAtual.nome,
            telefone: dto.telefone ?? funcionarioAtual.telefone,
            endereco: dto.endereco ?? funcionarioAtual.endereco,
            usuario: dto.usuario ?? funcionarioAtual.usuario,
            senha: dto.senha ? await this.hashSenha(dto.senha) : funcionarioAtual.senha,
            nivelPermissao: dto.nivelPermissao ?? funcionarioAtual.nivelPermissao
        });

        const resultado = await this.funcionarioRepository.atualizar(id, funcionarioAtualizado);
        return resultado ? resultado.toResponse() : null;
    }

    async deletar(id: string): Promise<boolean> {
        return this.funcionarioRepository.deletar(id);
    }

    private async hashSenha(senha: string): Promise<string> {
        if (!senha || senha.trim().length === 0) {
            throw new Error("Senha do funcionario e obrigatoria.");
        }

        return bcrypt.hash(senha, 10);
    }

    private normalizarNivelPermissaoFiltro(nivelPermissao?: string): NivelPermissao | undefined {
        if (!nivelPermissao || nivelPermissao.trim().length === 0) {
            return undefined;
        }

        const nivelNormalizado = nivelPermissao.trim().toUpperCase() as NivelPermissao;
        if (!Object.values(NivelPermissao).includes(nivelNormalizado)) {
            throw new Error("Nivel de permissao do funcionario invalido.");
        }

        return nivelNormalizado;
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
