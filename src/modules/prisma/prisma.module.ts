import { Global, Module } from "@nestjs/common";

import { CurrentUserService } from "../../shared/current-user.service";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService, CurrentUserService],
  exports: [PrismaService, CurrentUserService],
})
export class PrismaModule {}
