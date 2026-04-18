import { Injectable } from "@nestjs/common";

import { CurrentUserService } from "../../shared/current-user.service";
import { serializeUser } from "../../shared/serializers";

@Injectable()
export class MeService {
  constructor(private readonly currentUserService: CurrentUserService) {}

  async getMe(userId: string): Promise<ReturnType<typeof serializeUser>> {
    const user = await this.currentUserService.getRequiredUser(userId);
    return serializeUser(user);
  }
}
