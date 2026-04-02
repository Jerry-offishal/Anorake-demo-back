import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('create')
  createAuth(@Body() body: AuthDto) {
    return this.authService.createAuth(body);
  }

  @Post('login')
  getAuth(@Body() body: AuthDto) {
    return this.authService.getAuth(body);
  }
}
