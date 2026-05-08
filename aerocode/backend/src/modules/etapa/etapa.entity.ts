import { StatusTracker } from "../../shared/tracker";
import {
    criarStatusTrackerEtapa,
    StatusEtapa,
    statusTrackerEtapaToDTO,
    StatusTrackerEtapaDTO
} from "./etapa-status";

export type CriarEtapaDTO = {
    nome: string;
    prazoConclusao: string;
    prioridade: number;
    aeronaveCodigo: string;
    funcionariosIds?: string[];
};

export type AtualizarEtapaDTO = {
    nome?: string;
    prazoConclusao?: string;
    prioridade?: number;
    aeronaveCodigo?: string;
    funcionariosIds?: string[];
};

export type ListarEtapasDTO = {
    aeronaveCodigo?: string;
    nome?: string;
    prazoInicio?: string;
    prazoFim?: string;
    status?: string;
    page?: string;
    limit?: string;
};

export type PaginacaoResponseDTO = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type EtapaResponseDTO = {
    id: string;
    nome: string;
    prazoConclusao: string;
    prioridade: number;
    statusTracker: StatusTrackerEtapaDTO;
    aeronaveCodigo: string;
    funcionariosIds: string[];
};

export type ListarEtapasResponseDTO = {
    dados: EtapaResponseDTO[];
    paginacao: PaginacaoResponseDTO;
};

export type EtapaProps = {
    id: string;
    nome: string;
    prazoConclusao: string;
    prioridade: number;
    aeronaveCodigo: string;
    funcionariosIds?: string[];
    statusTracker?: StatusTracker<StatusEtapa> | StatusTrackerEtapaDTO;
};

export class Etapa {
    id: string;
    nome: string;
    prazoConclusao: string;
    prioridade: number;
    statusTracker: StatusTracker<StatusEtapa>;
    aeronaveCodigo: string;
    funcionariosIds: string[];

    constructor(props: EtapaProps) {
        Etapa.validarId(props.id);
        Etapa.validarNome(props.nome);
        Etapa.validarAeronaveCodigo(props.aeronaveCodigo);

        this.id = props.id.trim();
        this.nome = props.nome.trim();
        this.prazoConclusao = Etapa.normalizarPrazoConclusao(props.prazoConclusao);
        this.prioridade = Etapa.normalizarPrioridade(props.prioridade);
        this.aeronaveCodigo = props.aeronaveCodigo.trim();
        this.funcionariosIds = Etapa.normalizarFuncionariosIds(props.funcionariosIds ?? []);
        this.statusTracker = Etapa.criarStatusTracker(props);
    }

    prosseguirStatus(): void {
        this.statusTracker.prosseguirEtapa();
    }

    retrocederStatus(): void {
        this.statusTracker.retrocederEtapa();
    }

    iniciar(): void {
        const statusAtual = this.statusTracker.atual?.status;

        if (statusAtual === StatusEtapa.EM_ANDAMENTO) {
            throw new Error("A etapa ja esta em andamento.");
        }

        if (statusAtual === StatusEtapa.CONCLUIDA) {
            throw new Error("A etapa ja foi concluida.");
        }

        this.statusTracker.alterarPara(StatusEtapa.EM_ANDAMENTO);
    }

    finalizar(): void {
        const statusAtual = this.statusTracker.atual?.status;

        if (statusAtual === StatusEtapa.PENDENTE) {
            throw new Error("A etapa ainda nao foi iniciada.");
        }

        if (statusAtual === StatusEtapa.CONCLUIDA) {
            throw new Error("A etapa ja foi concluida.");
        }

        this.statusTracker.alterarPara(StatusEtapa.CONCLUIDA);
    }

    associarFuncionario(funcionarioId: string): void {
        const idNormalizado = Etapa.normalizarFuncionarioId(funcionarioId);

        if (this.funcionariosIds.includes(idNormalizado)) {
            throw new Error("Funcionario ja esta associado a esta etapa.");
        }

        this.funcionariosIds.push(idNormalizado);
    }

    desassociarFuncionario(funcionarioId: string): void {
        const idNormalizado = Etapa.normalizarFuncionarioId(funcionarioId);

        if (!this.funcionariosIds.includes(idNormalizado)) {
            throw new Error("Funcionario nao esta associado a esta etapa.");
        }

        this.funcionariosIds = this.funcionariosIds.filter((id) => id !== idNormalizado);
    }

    toResponse(): EtapaResponseDTO {
        return {
            id: this.id,
            nome: this.nome,
            prazoConclusao: this.prazoConclusao,
            prioridade: this.prioridade,
            statusTracker: statusTrackerEtapaToDTO(this.statusTracker),
            aeronaveCodigo: this.aeronaveCodigo,
            funcionariosIds: [...this.funcionariosIds]
        };
    }

    private static criarStatusTracker(props: EtapaProps): StatusTracker<StatusEtapa> {
        if (props.statusTracker instanceof StatusTracker) {
            return props.statusTracker;
        }

        return criarStatusTrackerEtapa(props.statusTracker?.historico);
    }

    private static validarId(id: string): void {
        if (!id || id.trim().length === 0) {
            throw new Error("Id da etapa e obrigatorio.");
        }
    }

    private static validarNome(nome: string): void {
        if (!nome || nome.trim().length === 0) {
            throw new Error("Nome da etapa e obrigatorio.");
        }
    }

    private static validarAeronaveCodigo(aeronaveCodigo: string): void {
        if (!aeronaveCodigo || aeronaveCodigo.trim().length === 0) {
            throw new Error("Aeronave da etapa e obrigatoria.");
        }
    }

    private static normalizarPrazoConclusao(prazoConclusao: string): string {
        if (!prazoConclusao || prazoConclusao.trim().length === 0) {
            throw new Error("Prazo para conclusao da etapa e obrigatorio.");
        }

        const data = new Date(prazoConclusao.trim());
        if (Number.isNaN(data.getTime())) {
            throw new Error("Prazo para conclusao da etapa deve ser uma data valida.");
        }

        return data.toISOString();
    }

    private static normalizarPrioridade(prioridade: number): number {
        const prioridadeNumerica = Number(prioridade);

        if (!Number.isInteger(prioridadeNumerica) || prioridadeNumerica < 0) {
            throw new Error("Prioridade da etapa deve ser um numero inteiro positivo ou zero.");
        }

        return prioridadeNumerica;
    }

    private static normalizarFuncionariosIds(funcionariosIds: string[]): string[] {
        if (!Array.isArray(funcionariosIds)) {
            throw new Error("Funcionarios da etapa devem ser uma lista de ids.");
        }

        const idsNormalizados = funcionariosIds.map((id) => Etapa.normalizarFuncionarioId(id));

        return Array.from(new Set(idsNormalizados));
    }

    private static normalizarFuncionarioId(funcionarioId: string): string {
        if (!funcionarioId || funcionarioId.trim().length === 0) {
            throw new Error("Id de funcionario invalido.");
        }

        return funcionarioId.trim();
    }
}
