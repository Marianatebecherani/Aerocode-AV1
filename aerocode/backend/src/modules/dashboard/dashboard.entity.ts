export type DashboardFiltrosDTO = {
    codigo?: string;
    modelo?: string;
    tipo?: string;
    capacidadeMin?: string;
    capacidadeMax?: string;
    alcanceMin?: string;
    alcanceMax?: string;
};

export type DashboardAeronavesResponseDTO = {
    total: number;
    "em producao": number;
    finalizadas: number;
};

export type DashboardEtapasResponseDTO = {
    total: number;
    pendentes: number;
    "em andamento": number;
    concluidas: number;
};

export type DashboardPecasResponseDTO = {
    total: number;
    "em producao": number;
    "em transporte": number;
    prontas: number;
};

export type DashboardTestesResponseDTO = {
    total: number;
    reprovados: number;
    aprovados: number;
};

export type DashboardRelatoriosResponseDTO = {
    total: number;
    "em producao": number;
    finalizadas: number;
};

export type DashboardResumoResponseDTO = {
    aeronaves: DashboardAeronavesResponseDTO;
    etapas: DashboardEtapasResponseDTO;
    pecas: DashboardPecasResponseDTO;
    testes: DashboardTestesResponseDTO;
    relatorios: DashboardRelatoriosResponseDTO;
};
