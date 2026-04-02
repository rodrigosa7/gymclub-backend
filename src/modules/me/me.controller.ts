import { Controller, Get } from "@nestjs/common";

import { MeService } from "./me.service";

@Controller("api")
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get("me")
  async getMe(): Promise<{ data: unknown }> {
    return {
      data: await this.meService.getMe(),
    };
  }
}
