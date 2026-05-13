import { DashboardService } from "./dashboard.service";
import { DashboardFiltrosDTO } from "./dashboard.entity";

export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    async resumo(filtros: DashboardFiltrosDTO) {
        return this.dashboardService.resumo(filtros);
    }

    async aeronaves(filtros: DashboardFiltrosDTO) {
        return this.dashboardService.aeronaves(filtros);
    }

    async etapas(filtros: DashboardFiltrosDTO) {
        return this.dashboardService.etapas(filtros);
    }

    async pecas(filtros: DashboardFiltrosDTO) {
        return this.dashboardService.pecas(filtros);
    }

    async testes(filtros: DashboardFiltrosDTO) {
        return this.dashboardService.testes(filtros);
    }

    async relatorios(filtros: DashboardFiltrosDTO) {
        return this.dashboardService.relatorios(filtros);
    }
}
