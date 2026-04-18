import { Controller, Get, Req, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { MeService } from "./me.service";

@Controller("api")
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return {
      data: await this.meService.getMe(req.user.userId),
    };
  }
}
