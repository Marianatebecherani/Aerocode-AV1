import { DashboardService } from "./dashboard.service";

export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    async resumo() {
        return this.dashboardService.resumo();
    }

    async aeronaves() {
        return this.dashboardService.aeronaves();
    }

    async etapas() {
        return this.dashboardService.etapas();
    }

    async pecas() {
        return this.dashboardService.pecas();
    }

    async testes() {
        return this.dashboardService.testes();
    }

    async relatorios() {
        return this.dashboardService.relatorios();
    }
}
