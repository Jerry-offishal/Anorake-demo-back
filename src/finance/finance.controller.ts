import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import {
  CreateRevenueDto,
  CreateExpenseDto,
  UpdateExpenseDto,
} from './finance.dto';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ─── REVENUES ───────────────────────────────────────

  @Post('revenue/create')
  createRevenue(@Body() body: CreateRevenueDto) {
    return this.financeService.createRevenue(body);
  }

  @Get('revenue/all/:tenantId')
  findAllRevenues(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.financeService.findAllRevenues(
      tenantId,
      page || 1,
      limit || 20,
    );
  }

  // ─── EXPENSES ───────────────────────────────────────

  @Post('expense/create')
  createExpense(@Body() body: CreateExpenseDto) {
    return this.financeService.createExpense(body);
  }

  @Get('expense/all/:tenantId')
  findAllExpenses(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.financeService.findAllExpenses(
      tenantId,
      page || 1,
      limit || 20,
    );
  }

  @Patch('expense/:id')
  updateExpense(@Param('id') id: string, @Body() body: UpdateExpenseDto) {
    return this.financeService.updateExpense(id, body);
  }

  @Delete('expense/:id')
  deleteExpense(@Param('id') id: string) {
    return this.financeService.deleteExpense(id);
  }

  // ─── COGS ───────────────────────────────────────────

  @Get('recipe-cost/:recipeId')
  getRecipeCost(@Param('recipeId') recipeId: string) {
    return this.financeService.getRecipeCost(recipeId);
  }

  @Get('profit-by-recipe/:tenantId')
  getProfitByRecipe(@Param('tenantId') tenantId: string) {
    return this.financeService.getProfitByRecipe(tenantId);
  }

  // ─── DASHBOARD ──────────────────────────────────────

  @Get('dashboard/:tenantId')
  getDashboard(
    @Param('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.financeService.getDashboard(tenantId, from, to);
  }

  // ─── DAILY ANALYSIS ────────────────────────────────

  @Get('daily/:tenantId')
  getDailyAnalysis(
    @Param('tenantId') tenantId: string,
    @Query('days') days?: number,
  ) {
    return this.financeService.getDailyAnalysis(tenantId, days || 30);
  }
}
