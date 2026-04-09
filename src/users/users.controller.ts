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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('create')
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @CheckPolicies({ action: Action.Create, subject: Subject.User })
  createUser(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  @Get('all')
  @ApiOperation({ summary: 'Lister les utilisateurs' })
  @CheckPolicies({ action: Action.Read, subject: Subject.User })
  findAllForUser(@Query('page') page: number, @Query('limit') limit: number) {
    return this.userService.findAllForUser(page || 1, limit || 10);
  }

  @Get('search')
  @ApiOperation({ summary: 'Rechercher un utilisateur par email' })
  @CheckPolicies({ action: Action.Read, subject: Subject.User })
  async searchByEmail(@Query() query: SearchUserDto) {
    return this.userService.searchByEmail(query.email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par ID' })
  @CheckPolicies({ action: Action.Read, subject: Subject.User })
  findUserById(@Param('id') userId: string) {
    return this.userService.findUserById(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un utilisateur' })
  @CheckPolicies({ action: Action.Update, subject: Subject.User })
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.updateUser(id, body);
  }
}
