export enum TipoTeste {
    ELETRICO = "ELETRICO",
    HIDRAULICO = "HIDRAULICO",
    AERODINAMICO = "AERODINAMICO"
}

export enum ResultadoTeste {
    APROVADO = "APROVADO",
    REPROVADO = "REPROVADO"
}

export type CriarTesteDTO = {
    tipo: TipoTeste | string;
    resultado: ResultadoTeste | string;
};

export type AtualizarTesteDTO = {
    tipo?: TipoTeste | string;
    resultado?: ResultadoTeste | string;
};

export type TesteResponseDTO = {
    id: string;
    tipo: TipoTeste;
    resultado: ResultadoTeste;
};

export type TesteProps = {
    id: string;
    tipo: TipoTeste | string;
    resultado: ResultadoTeste | string;
};

export class Teste {
    id: string;
    tipo: TipoTeste;
    resultado: ResultadoTeste;

    constructor(props: TesteProps) {
        Teste.validarId(props.id);

        this.id = props.id.trim();
        this.tipo = Teste.normalizarTipo(props.tipo);
        this.resultado = Teste.normalizarResultado(props.resultado);
    }

    toResponse(): TesteResponseDTO {
        return {
            id: this.id,
            tipo: this.tipo,
            resultado: this.resultado
        };
    }

    private static validarId(id: string): void {
        if (!id || id.trim().length === 0) {
            throw new Error("Id do teste e obrigatorio.");
        }
    }

    private static normalizarTipo(tipo: TipoTeste | string): TipoTeste {
        const tipoNormalizado = tipo?.trim().toUpperCase() as TipoTeste;

        if (!Object.values(TipoTeste).includes(tipoNormalizado)) {
            throw new Error("Tipo do teste invalido.");
        }

        return tipoNormalizado;
    }

    private static normalizarResultado(resultado: ResultadoTeste | string): ResultadoTeste {
        const resultadoNormalizado = resultado?.trim().toUpperCase() as ResultadoTeste;

        if (!Object.values(ResultadoTeste).includes(resultadoNormalizado)) {
            throw new Error("Resultado do teste invalido.");
        }

        return resultadoNormalizado;
    }
}
