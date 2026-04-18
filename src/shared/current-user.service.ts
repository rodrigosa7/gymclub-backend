import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";

import { PrismaService } from "../modules/prisma/prisma.service";
import { AppException } from "./app.exception";

@Injectable()
export class CurrentUserService {
  constructor(private readonly prisma: PrismaService) {}

  async getRequiredUser(userId?: string): Promise<User> {
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new AppException("User not found", 404);
      }
      return user;
    }

    // Fallback to first user (demo mode)
    const user = await this.prisma.user.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!user) {
      throw new AppException("No user exists yet. Start Postgres and run the Prisma seed first.", 500);
    }

    return user;
  }
}
