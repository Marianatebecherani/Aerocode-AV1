export enum NivelPermissao {
    ADMINISTRADOR = "ADMINISTRADOR",
    ENGENHEIRO = "ENGENHEIRO",
    OPERADOR = "OPERADOR"
}

export type CriarFuncionarioDTO = {
    nome: string;
    telefone: string;
    endereco: string;
    usuario: string;
    senha: string;
    nivelPermissao: NivelPermissao | string;
};

export type AtualizarFuncionarioDTO = {
    nome?: string;
    telefone?: string;
    endereco?: string;
    usuario?: string;
    senha?: string;
    nivelPermissao?: NivelPermissao | string;
};

export type FuncionarioResponseDTO = {
    id: string;
    nome: string;
    telefone: string;
    endereco: string;
    usuario: string;
    nivelPermissao: NivelPermissao;
};

export type FuncionarioProps = {
    id: string;
    nome: string;
    telefone: string;
    endereco: string;
    usuario: string;
    senha: string;
    nivelPermissao: NivelPermissao | string;
};

export class Funcionario {
    id: string;
    nome: string;
    telefone: string;
    endereco: string;
    usuario: string;
    senha: string;
    nivelPermissao: NivelPermissao;

    constructor(props: FuncionarioProps) {
        Funcionario.validarId(props.id);
        Funcionario.validarNome(props.nome);
        Funcionario.validarTelefone(props.telefone);
        Funcionario.validarEndereco(props.endereco);
        Funcionario.validarUsuario(props.usuario);
        Funcionario.validarSenha(props.senha);

        this.id = props.id.trim();
        this.nome = props.nome.trim();
        this.telefone = props.telefone.trim();
        this.endereco = props.endereco.trim();
        this.usuario = props.usuario.trim();
        this.senha = props.senha;
        this.nivelPermissao = Funcionario.normalizarNivelPermissao(props.nivelPermissao);
    }

    toResponse(): FuncionarioResponseDTO {
        return {
            id: this.id,
            nome: this.nome,
            telefone: this.telefone,
            endereco: this.endereco,
            usuario: this.usuario,
            nivelPermissao: this.nivelPermissao
        };
    }

    private static validarId(id: string): void {
        if (!id || id.trim().length === 0) {
            throw new Error("Id do funcionario e obrigatorio.");
        }
    }

    private static validarNome(nome: string): void {
        if (!nome || nome.trim().length === 0) {
            throw new Error("Nome do funcionario e obrigatorio.");
        }
    }

    private static validarTelefone(telefone: string): void {
        if (!telefone || telefone.trim().length === 0) {
            throw new Error("Telefone do funcionario e obrigatorio.");
        }
    }

    private static validarEndereco(endereco: string): void {
        if (!endereco || endereco.trim().length === 0) {
            throw new Error("Endereco do funcionario e obrigatorio.");
        }
    }

    private static validarUsuario(usuario: string): void {
        if (!usuario || usuario.trim().length === 0) {
            throw new Error("Usuario do funcionario e obrigatorio.");
        }
    }

    private static validarSenha(senha: string): void {
        if (!senha || senha.trim().length === 0) {
            throw new Error("Senha do funcionario e obrigatoria.");
        }
    }

    private static normalizarNivelPermissao(nivelPermissao: NivelPermissao | string): NivelPermissao {
        const nivelNormalizado = nivelPermissao?.trim().toUpperCase() as NivelPermissao;

        if (!Object.values(NivelPermissao).includes(nivelNormalizado)) {
            throw new Error("Nivel de permissao do funcionario invalido.");
        }

        return nivelNormalizado;
    }
}
