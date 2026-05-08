export interface StatusInfo<TStatus extends string> {
    codigo: TStatus;
    ordem: number;
    descricao: string;
}

export interface StatusRegistro<TStatus extends string> {
    status: TStatus;
    data: Date;
}

export class StatusTracker<TStatus extends string> {
    private readonly statusDisponiveis: StatusInfo<TStatus>[];
    private historico: StatusRegistro<TStatus>[];

    constructor(
        statusDisponiveis: StatusInfo<TStatus>[],
        iniciarNoPrimeiroStatus = true,
        historico: StatusRegistro<TStatus>[] = []
    ) {
        this.statusDisponiveis = [...statusDisponiveis].sort((a, b) => a.ordem - b.ordem);
        this.historico = historico.map((registro) => ({
            status: registro.status,
            data: new Date(registro.data)
        }));

        if (iniciarNoPrimeiroStatus && this.historico.length === 0) {
            const primeiroStatus = this.statusDisponiveis[0];
            if (primeiroStatus) {
                this.historico.push({
                    status: primeiroStatus.codigo,
                    data: new Date()
                });
            }
        }
    }

    get atual(): StatusRegistro<TStatus> | null {
        return this.historico[this.historico.length - 1] ?? null;
    }

    listarStatus(): StatusInfo<TStatus>[] {
        return [...this.statusDisponiveis];
    }

    listarHistorico(): StatusRegistro<TStatus>[] {
        return this.historico.map((registro) => ({ ...registro }));
    }

    alterarPara(status: TStatus, data: Date = new Date()): void {
        const novoStatusInfo = this.buscarStatus(status);
        const atual = this.atual;

        if (!atual) {
            this.historico.push({ status, data });
            return;
        }

        const atualInfo = this.buscarStatus(atual.status);

        if (novoStatusInfo.ordem === atualInfo.ordem) {
            this.historico[this.historico.length - 1] = { status, data };
            return;
        }

        if (novoStatusInfo.ordem > atualInfo.ordem) {
            this.validarProximaEtapa(novoStatusInfo, atualInfo);
            this.historico.push({ status, data });
            return;
        }

        this.voltarPara(status, data);
    }

    prosseguirEtapa(data: Date = new Date()): void {
        const atual = this.atual;

        if (!atual) {
            const primeiroStatus = this.statusDisponiveis[0];
            if (primeiroStatus) {
                this.alterarPara(primeiroStatus.codigo, data);
            }
            return;
        }

        const atualInfo = this.buscarStatus(atual.status);
        const proximoStatus = this.statusDisponiveis.find(
            (status) => status.ordem === atualInfo.ordem + 1
        );

        if (proximoStatus) {
            this.alterarPara(proximoStatus.codigo, data);
        }
    }

    retrocederEtapa(data: Date = new Date()): void {
        const atual = this.atual;
        if (!atual) return;

        const atualInfo = this.buscarStatus(atual.status);
        const statusAnterior = this.statusDisponiveis.find(
            (status) => status.ordem === atualInfo.ordem - 1
        );

        if (statusAnterior) {
            this.alterarPara(statusAnterior.codigo, data);
        }
    }

    private voltarPara(status: TStatus, data: Date): void {
        const statusInfo = this.buscarStatus(status);

        this.historico = this.historico.filter(
            (item) => this.buscarStatus(item.status).ordem < statusInfo.ordem
        );
        this.historico.push({ status, data });
    }

    private validarProximaEtapa(
        novoStatus: StatusInfo<TStatus>,
        statusAtual: StatusInfo<TStatus>
    ): void {
        if (novoStatus.ordem !== statusAtual.ordem + 1) {
            throw new Error(
                `Nao e possivel pular etapas. Status atual: ${statusAtual.descricao}. Proximo permitido: ordem ${statusAtual.ordem + 1}.`
            );
        }
    }

    private buscarStatus(status: TStatus): StatusInfo<TStatus> {
        const encontrado = this.statusDisponiveis.find((item) => item.codigo === status);

        if (!encontrado) {
            throw new Error(`Status invalido: ${status}`);
        }

        return encontrado;
    }
}
