import { Controller, Get, Param, Query, Req, Res } from "@nestjs/common";
import SongService from "../services/song.service";
import { handleHTTPResponse } from "../libs/http-response";

@Controller("song")
export default class SongController {
  constructor(private readonly songService: SongService) {}

  @Get("/info")
  public async getSongInfo(@Query() { url }) {
    return await this.songService.getSongInfo({ url });
  }

  @Get("/version")
  public async getVersion() {
    return "0.01";
  }

  @Get("/play")
  public async playSong(@Query() { videoId }) {
    const data: any = await this.songService.playSong({ videoId });
    return handleHTTPResponse(data);
  }

  @Get("/search")
  public async searchSong(@Query() { searchQuery }) {
    const data = this.songService.searchSong({ searchQuery });
    return handleHTTPResponse(data);
  }

  @Get("/:id")
  public async searchSongById(@Param("id") id) {
    const data = this.songService.searchSongById({ id });
    return handleHTTPResponse(data);
  }
}
