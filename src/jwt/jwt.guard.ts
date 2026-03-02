import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { ea } from "src/common/go-err";
import { Payload } from "src/jwt/jwt.payload";

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient<Socket>();

    const token = client.handshake.headers["x-access-token"] as string;

    if (token === undefined) {
      throw new WsException("no access token provided");
    }

    var [payload, err] = await ea(() =>
      this.jwtService.verifyAsync<Payload>(token),
    );

    if (err !== undefined) throw new WsException("invalid access token");

    client.data.user = payload;

    return true;
  }
}
