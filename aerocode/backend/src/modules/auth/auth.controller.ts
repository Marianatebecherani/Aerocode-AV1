import { AuthService, LoginDTO } from "./auth.service";

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    async login(dto: LoginDTO) {
        return this.authService.login(dto);
    }
}
