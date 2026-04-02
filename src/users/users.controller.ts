import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, SearchUserDto, UpdateUserDto } from './users.dto';

@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('create')
  createUser(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  @Get('all')
  findAllForUser(@Query('page') page: number, @Query('limit') limit: number) {
    return this.userService.findAllForUser(page || 1, limit || 10);
  }

  @Get('search')
  async searchByEmail(@Query() query: SearchUserDto) {
    return this.userService.searchByEmail(query.email);
  }

  @Get(':id')
  findUserById(@Param('id') userId: string) {
    return this.userService.findUserById(userId);
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.updateUser(id, body);
  }
}
