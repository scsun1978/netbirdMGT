import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: ExpressRequest) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: ExpressRequest) {
    return req.user;
  }
}