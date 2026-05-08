import * as bcrypt from "bcrypt";
import {
    AtualizarFuncionarioDTO,
    CriarFuncionarioDTO,
    Funcionario,
    FuncionarioResponseDTO
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

    async listar(): Promise<FuncionarioResponseDTO[]> {
        const funcionarios = await this.funcionarioRepository.listar();
        return funcionarios.map((funcionario) => funcionario.toResponse());
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
}
