import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthDto, SignupDto } from './auth.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/casl/public.decorator';

@ApiTags('Auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('create')
  @ApiOperation({ summary: 'Créer un compte' })
  createAuth(@Body() body: AuthDto) {
    return this.authService.createAuth(body);
  }

  @Post('signup')
  @ApiOperation({ summary: "S'inscrire (Auth + User)" })
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Se connecter' })
  getAuth(@Body() body: AuthDto) {
    return this.authService.getAuth(body);
  }
}
