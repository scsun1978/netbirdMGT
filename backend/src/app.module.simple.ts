import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { NetBirdModule } from './modules/netbird/netbird.module';
import { PeersModule } from './modules/peers/peers.module';
import { NetworksModule } from './modules/networks/networks.module';
import { UsersModule } from './modules/users/users.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { SetupKeysModule } from './modules/setup-keys/setup-keys.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { AuditModule } from './modules/audit/audit.module';
import { WebsocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
    NetBirdModule,
    PeersModule,
    NetworksModule,
    UsersModule,
    TokensModule,
    SetupKeysModule,
    AlertsModule,
    AuditModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}