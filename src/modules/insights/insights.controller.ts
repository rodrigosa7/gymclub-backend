import { Controller, Get } from "@nestjs/common";

import { InsightsService } from "./insights.service";

@Controller("api")
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get("history")
  async getHistory(): Promise<{ data: unknown }> {
    return {
      data: await this.insightsService.getHistory(),
    };
  }

  @Get("analytics/overview")
  async getAnalyticsOverview(): Promise<{ data: unknown }> {
    return {
      data: await this.insightsService.getAnalyticsOverview(),
    };
  }
}
