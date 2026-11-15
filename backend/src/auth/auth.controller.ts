import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Créer un compte (rôle VIEWER par défaut)' })
  @ApiResponse({ status: 201, description: 'Compte créé, retourne un access_token.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Se connecter et obtenir un JWT' })
  @ApiResponse({ status: 200, description: 'Connexion réussie, retourne un access_token.' })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect.' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Profil de l\'utilisateur connecté' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Profil retourné sans le mot de passe.' })
  @ApiResponse({ status: 401, description: 'Token manquant ou invalide.' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: any) {
    return this.authService.me(req.user.id);
  }
}
