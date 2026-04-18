import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";

import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto): Promise<{ accessToken: string; user: Omit<User, "passwordHash"> }> {
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        preferredWeightUnit: data.preferredWeightUnit,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

    return { accessToken, user: userWithoutPassword };
  }

  async login(data: LoginDto): Promise<{ accessToken: string; user: Omit<User, "passwordHash"> }> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

    return { accessToken, user: userWithoutPassword };
  }
}
