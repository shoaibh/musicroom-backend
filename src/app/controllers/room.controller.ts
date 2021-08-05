import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { handleHTTPResponse } from '../libs/http-response';
import AuthenticationGuard from '../guards/authentication.guard';
import Vp from '../pipes/vp';
import { IdSchema } from '../joi-schema/user.schema';
import RoomService from '../services/room.service';
import { AuthDetailsDto } from '../dtos/auth.dto';
import AuthDetail from '../utils/decorators/auth-detail.decorator';

@Controller('room')
export default class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get('/')
  @UseGuards(AuthenticationGuard)
  public async getRooms() {
    const data = await this.roomService.getAllRooms();
    return handleHTTPResponse(data);
  }

  @Post('/create')
  @HttpCode(200)
  public async login(@Body() roomData) {
    const data = await this.roomService.createRoom(roomData);
    return handleHTTPResponse(data);
  }

  @Get('/:id')
  @UseGuards(AuthenticationGuard)
  public async getRoom(@Param('id', Vp.for(IdSchema)) id: number) {
    const data = await this.roomService.getSingleRoom(id);
    return handleHTTPResponse(data);
  }

  @Post('/join/:roomId')
  @UseGuards(AuthenticationGuard)
  public async joinRoom(
    @AuthDetail() authDetails: AuthDetailsDto,
    @Param('roomId', Vp.for(IdSchema)) roomId: number,
  ) {
    const data = await this.roomService.joinRoom(authDetails, roomId);
    return handleHTTPResponse(data);
  }

  @Post('/leave/:roomId')
  @UseGuards(AuthenticationGuard)
  public async leaveRoom(
    @AuthDetail() authDetails: AuthDetailsDto,
    @Param('roomId', Vp.for(IdSchema)) roomId: number,
  ) {
    const data = await this.roomService.leaveRoom(authDetails, roomId);
    return handleHTTPResponse(data);
  }

  @Put('/update/:roomId')
  @UseGuards(AuthenticationGuard)
  public async updateSong(
    @Param('roomId', Vp.for(IdSchema)) roomId: number,
    @Body() { videoId },
  ) {
    const data = await this.roomService.updateSong(roomId, videoId);
    return handleHTTPResponse(data);
  }
}
