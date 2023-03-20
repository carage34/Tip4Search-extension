/// <reference types="chrome"/>
import { Component } from '@angular/core';
import {Video} from "../models/video.model";
import {VideoService} from "../services/video.service";
import {Observable} from "rxjs";
import {Message} from "../models/message.model";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
  title = 'angular-chrome-app';
  public videos: Video[];
  constructor(private videoService: VideoService) {

    videoService.getVideos().subscribe((videos: Video[]) => {
      this.videos = videos;
      this.videos.forEach((video) => {
        videoService.replaceUrl(video)
        this.getMessages(video._id).subscribe(messages => {
          video.messages = messages;
        })
      });
      this.videos.reverse();
    });
  }

  public getMessages(id: string) {
    return new Observable<Message[]>(observer => {
      this.videoService.getMessageByVideoId(id).subscribe((messages) => {
        observer.next(messages)
        observer.complete();
      })
    })
  }

  public toggleShowSong(video: Video) {
    video.showSong = !video.showSong;

  }

  public async goToTimestamp(video: Video, offsetSecond: number) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}).then((tabs) => {
      console.log("query");
      console.log(tabs)

      let newURL = "https://www.twitch.tv/videos/";
      //chrome.tabs.create({url: `${newURL}${video.twitchid}`}).then((tab) => {
        chrome.runtime.sendMessage({ tabid: tabs[0].id, videoid: `${video.twitchid}`, offset: offsetSecond }, (response) => {
          // 3. Got an asynchronous response with the data from the service worker
          console.log('received user data', response);
        });
      //});
    });
  }
}
