import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("api")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("auth/register")
  async register(@Body() data: RegisterDto) {
    return {
      data: await this.authService.register(data),
    };
  }

  @Post("auth/login")
  async login(@Body() data: LoginDto) {
    return {
      data: await this.authService.login(data),
    };
  }
}
