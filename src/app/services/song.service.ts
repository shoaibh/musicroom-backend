import { Injectable } from '@nestjs/common';
import ytdl = require('ytdl-core');
import HttpResponse from '../libs/http-response';
import yts = require('yt-search');
import lf = require('lyrics-finder');

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
      filter: 'audioonly',
      quality: 'highestaudio',
    });

    // console.log('==', { format: audioFormat });

    // const { itag, container, contentLength } = audioFormat;

    // const rangePosition = rangeHeader
    //   ? rangeHeader.replace(/bytes=/, '').split('-')
    //   : null;

    // const startRange = rangePosition ? parseInt(rangePosition[0], 10) : 0;
    // let endRange: number;
    // if (rangePosition && rangePosition[1].length > 0) {
    //   endRange = parseInt(rangePosition[1], 10);
    // } else {
    //   // @ts-ignore
    //   endRange = contentLength - 1;
    // }
    // const chunksize = endRange - startRange + 1;
    // const range = { start: startRange, end: endRange };
    // const audioStream = ytdl(videoId, {
    //   filter: (format) => format.itag === itag,
    //   range,
    // });
    return HttpResponse.success({
      audioUrl: audioFormat?.url,
    });
  }

  public async searchSong({ searchQuery }) {
    try {
      const r = await yts(searchQuery);
      const videos = r.all.slice(0, 4);
      return HttpResponse.success(videos);
    } catch (e) {
      return HttpResponse.error('No Videos Found');
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
        filter: 'audioonly',
        quality: 'highestaudio',
      });
      console.log('==', { videoInfo });
      return HttpResponse.success({
        ...videoInfo.videoDetails,
        audioUrl: audioFormat?.url,
      });
    } catch (e) {
      return HttpResponse.error('No video for this id');
    }
  }

  public async getLyrics({ title = '', artist = '' }) {
    const lyrics = (await lf(artist, title)) || 'no lyrics found';
    return HttpResponse.success(lyrics);
  }
}
