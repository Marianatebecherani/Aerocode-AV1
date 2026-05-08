import * as bcrypt from "bcrypt";
import { FuncionarioResponseDTO } from "../funcionario";
import { FuncionarioRepository } from "../funcionario/funcionario.repository";

export type LoginDTO = {
    usuario: string;
    senha: string;
};

export type LoginResponseDTO = {
    autenticado: boolean;
    funcionario?: FuncionarioResponseDTO;
};

export class AuthService {
    constructor(private readonly funcionarioRepository: FuncionarioRepository) {}

    async login(dto: LoginDTO): Promise<LoginResponseDTO> {
        this.validarCredenciais(dto);

        const funcionario = await this.funcionarioRepository.buscarPorUsuario(dto.usuario);
        if (!funcionario) {
            return { autenticado: false };
        }

        const senhaCorreta = await bcrypt.compare(dto.senha, funcionario.senha);
        if (!senhaCorreta) {
            return { autenticado: false };
        }

        return {
            autenticado: true,
            funcionario: funcionario.toResponse()
        };
    }

    private validarCredenciais(dto: LoginDTO): void {
        if (!dto.usuario || dto.usuario.trim().length === 0) {
            throw new Error("Usuario e obrigatorio.");
        }

        if (!dto.senha || dto.senha.trim().length === 0) {
            throw new Error("Senha e obrigatoria.");
        }
    }
}
