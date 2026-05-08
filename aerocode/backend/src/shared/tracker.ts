export interface TrackerInfo<TValor extends string> {
    codigo: TValor;
    ordem: number;
    descricao: string;
}

export type TrackerRegistro<TValor extends string, TCampo extends string> = {
    data: Date;
} & Record<TCampo, TValor>;

export class Tracker<TValor extends string, TCampo extends string> {
    private readonly valoresDisponiveis: TrackerInfo<TValor>[];
    private readonly campoRegistro: TCampo;
    private historico: TrackerRegistro<TValor, TCampo>[];

    constructor(
        valoresDisponiveis: TrackerInfo<TValor>[],
        campoRegistro: TCampo,
        iniciarNoPrimeiroValor = true,
        historico: TrackerRegistro<TValor, TCampo>[] = []
    ) {
        this.valoresDisponiveis = [...valoresDisponiveis].sort((a, b) => a.ordem - b.ordem);
        this.campoRegistro = campoRegistro;
        this.historico = historico.map((registro) =>
            this.criarRegistro(this.obterValorRegistro(registro), new Date(registro.data))
        );

        if (iniciarNoPrimeiroValor && this.historico.length === 0) {
            const primeiroValor = this.valoresDisponiveis[0];
            if (primeiroValor) {
                this.historico.push(this.criarRegistro(primeiroValor.codigo, new Date()));
            }
        }
    }

    get atual(): TrackerRegistro<TValor, TCampo> | null {
        return this.historico[this.historico.length - 1] ?? null;
    }

    listarValores(): TrackerInfo<TValor>[] {
        return [...this.valoresDisponiveis];
    }

    listarHistorico(): TrackerRegistro<TValor, TCampo>[] {
        return this.historico.map((registro) =>
            this.criarRegistro(this.obterValorRegistro(registro), new Date(registro.data))
        );
    }

    alterarPara(valor: TValor, data: Date = new Date(), substituirMesmoNivel = true): void {
        const novoValorInfo = this.buscarValor(valor);
        const atual = this.atual;

        if (!atual) {
            this.historico.push(this.criarRegistro(valor, data));
            return;
        }

        const atualInfo = this.buscarValor(this.obterValorRegistro(atual));

        if (novoValorInfo.ordem === atualInfo.ordem) {
            if (substituirMesmoNivel) {
                this.historico[this.historico.length - 1] = this.criarRegistro(valor, data);
                return;
            }

            this.historico.push(this.criarRegistro(valor, data));
            return;
        }

        if (novoValorInfo.ordem > atualInfo.ordem) {
            this.validarProximoValor(novoValorInfo, atualInfo);
            this.historico.push(this.criarRegistro(valor, data));
            return;
        }

        this.voltarPara(valor, data);
    }

    prosseguirEtapa(data: Date = new Date()): void {
        const atual = this.atual;

        if (!atual) {
            const primeiroValor = this.valoresDisponiveis[0];
            if (primeiroValor) {
                this.alterarPara(primeiroValor.codigo, data);
            }
            return;
        }

        const atualInfo = this.buscarValor(this.obterValorRegistro(atual));
        const proximoValor = this.valoresDisponiveis.find(
            (valor) => valor.ordem === atualInfo.ordem + 1
        );

        if (proximoValor) {
            this.alterarPara(proximoValor.codigo, data);
        }
    }

    retrocederEtapa(data: Date = new Date()): void {
        const atual = this.atual;
        if (!atual) return;

        const atualInfo = this.buscarValor(this.obterValorRegistro(atual));
        const valorAnterior = this.valoresDisponiveis.find(
            (valor) => valor.ordem === atualInfo.ordem - 1
        );

        if (valorAnterior) {
            this.alterarPara(valorAnterior.codigo, data);
        }
    }

    protected obterValorAtual(): TValor | null {
        const atual = this.atual;
        return atual ? this.obterValorRegistro(atual) : null;
    }

    private voltarPara(valor: TValor, data: Date): void {
        const valorInfo = this.buscarValor(valor);

        this.historico = this.historico.filter(
            (item) => this.buscarValor(this.obterValorRegistro(item)).ordem < valorInfo.ordem
        );
        this.historico.push(this.criarRegistro(valor, data));
    }

    private validarProximoValor(
        novoValor: TrackerInfo<TValor>,
        valorAtual: TrackerInfo<TValor>
    ): void {
        if (novoValor.ordem !== valorAtual.ordem + 1) {
            throw new Error(
                `Nao e possivel pular etapas. Valor atual: ${valorAtual.descricao}. Proximo permitido: ordem ${valorAtual.ordem + 1}.`
            );
        }
    }

    private buscarValor(valor: TValor): TrackerInfo<TValor> {
        const encontrado = this.valoresDisponiveis.find((item) => item.codigo === valor);

        if (!encontrado) {
            throw new Error(`Valor invalido: ${valor}`);
        }

        return encontrado;
    }

    private obterValorRegistro(registro: TrackerRegistro<TValor, TCampo>): TValor {
        return registro[this.campoRegistro];
    }

    private criarRegistro(valor: TValor, data: Date): TrackerRegistro<TValor, TCampo> {
        return {
            [this.campoRegistro]: valor,
            data
        } as TrackerRegistro<TValor, TCampo>;
    }
}

export type StatusInfo<TStatus extends string> = TrackerInfo<TStatus>;
export type StatusRegistro<TStatus extends string> = TrackerRegistro<TStatus, "status">;

export class StatusTracker<TStatus extends string> extends Tracker<TStatus, "status"> {
    constructor(
        statusDisponiveis: StatusInfo<TStatus>[],
        iniciarNoPrimeiroStatus = true,
        historico: StatusRegistro<TStatus>[] = []
    ) {
        super(statusDisponiveis, "status", iniciarNoPrimeiroStatus, historico);
    }

    listarStatus(): StatusInfo<TStatus>[] {
        return this.listarValores();
    }
}
