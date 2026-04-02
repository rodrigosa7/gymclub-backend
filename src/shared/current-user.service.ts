import { HttpStatus, Injectable } from "@nestjs/common";
import { User } from "@prisma/client";

import { PrismaService } from "../modules/prisma/prisma.service";
import { AppException } from "./app.exception";

@Injectable()
export class CurrentUserService {
  constructor(private readonly prisma: PrismaService) {}

  async getRequiredUser(): Promise<User> {
    const user = await this.prisma.user.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!user) {
      throw new AppException(
        "No user exists yet. Start Postgres and run the Prisma seed first.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return user;
  }
}
