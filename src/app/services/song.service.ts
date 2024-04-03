import { Injectable } from "@nestjs/common";
import HttpResponse from "../libs/http-response";
import ytdl = require("ytdl-core");
import yts = require("yt-search");

@Injectable()
export default class SongService {
  public async getSongInfo({ url }) {
    try {
      const videoId = await ytdl.getURLVideoID(url);
      const videoInfo = await ytdl.getInfo(videoId);
      const { thumbnail, author, title } = videoInfo.videoDetails;
      return HttpResponse.success({ thumbnail, author, title, videoId });
    } catch (e) {
      return HttpResponse.notFound();
    }
  }

  public async playSong({ videoId }) {
    const isValid = ytdl.validateID(videoId);
    if (!isValid) {
      return HttpResponse.notFound();
    }
    const videoInfo = await ytdl.getInfo(videoId);
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, {
      filter: "audioonly",
      quality: "highestaudio",
    });

    return HttpResponse.success({
      audioUrl: audioFormat?.url,
    });
  }

  public async searchSong({ searchQuery }) {
    try {
      const r = await yts({
        search: searchQuery,
        pageStart: 0,
        pageEnd: 10,
        category: "music",
      });
      const videos = r.videos;
      return HttpResponse.success(videos);
    } catch (e) {
      console.log(e);
      return HttpResponse.error("No Videos Found");
    }
  }

  public async searchSongById({ id }) {
    try {
      const isValid = ytdl.validateID(id);
      if (!isValid) {
        return HttpResponse.notFound();
      }
      const videoInfo = await ytdl.getInfo(id);

      const audioFormat = ytdl.chooseFormat(videoInfo.formats, {
        filter: "audioonly",
        quality: "highestaudio",
      });
      return HttpResponse.success({
        ...videoInfo.videoDetails,
        audioUrl: audioFormat?.url,
      });
    } catch (e) {
      return HttpResponse.error("No video for this id");
    }
  }
}
