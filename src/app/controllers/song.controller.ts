import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import SongService from '../services/song.service';
import { handleHTTPResponse } from '../libs/http-response';
import { Request, Response } from 'express';

@Controller('song')
export default class SongController {
  constructor(private readonly songService: SongService) {}

  @Get('/info')
  public async getSongInfo(@Query() { url }) {
    return await this.songService.getSongInfo({ url });
  }

  @Get('/version')
  public async getVersion() {
    return '0.01';
  }

  @Get('/play')
  public async playSong(
    @Query() { videoId },
    @Req() request: Request,
    @Res() response: Response,
  ) {
    // const rangeHeader = request.headers.range || null;
    // console.log('==before');
    const data: any = await this.songService.playSong({ videoId });
    // console.log('sdf', { data });
    const { audioUrl } = data.data;
    // response.writeHead(206, {
    //   'Content-Type': `audio/${container}`,
    //   'Content-Length': chunksize,
    //   'Content-Range':
    //     'bytes ' + startRange + '-' + endRange + '/' + contentLength,
    //   'Accept-Ranges': 'bytes',
    // });
    // audioStream.pipe(response);
    return handleHTTPResponse(data);
  }

  @Get('/search')
  public async searchSong(@Query() { searchQuery }) {
    const data = this.songService.searchSong({ searchQuery });
    return handleHTTPResponse(data);
  }

  @Get('/:id')
  public async searchSongById(@Param('id') id) {
    const data = this.songService.searchSongById({ id });
    return handleHTTPResponse(data);
  }

  @Get('/lyrics')
  public async getLyrics(@Query() { title, artist }) {
    const data = this.songService.getLyrics({ title, artist });
    return handleHTTPResponse(data);
  }
}
