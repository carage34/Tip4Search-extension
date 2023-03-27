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
    // Logique récupération VODs et message des gagnants qui contient les morceaux joués
    videoService.getVideos().subscribe((videos: Video[]) => {
      this.videos = videos;
      this.videos.forEach((video) => {
        videoService.replaceUrl(video)
        this.getMessages(video._id).subscribe(messages => {
          video.messages = messages;
        })
      });
      // Afficher les VODs les plus récente
      this.videos.reverse();
    });
  }

  /**
   * Retourne les messages des gagnants qui contient les morceaux joués par videoid
   * @param id video
   */
  public getMessages(id: string) {
    return new Observable<Message[]>(observer => {
      this.videoService.getMessageByVideoId(id).subscribe((messages) => {
        observer.next(messages)
        observer.complete();
      })
    })
  }

  /**
   * Affiche ou cache la liste des morceaux joués pour une VOD
   * @param video
   */
  public toggleShowSong(video: Video) {
    video.showSong = !video.showSong;

  }

  /**
   * Convertit un nombre de secondes au format hh:mm:ss
   * @param message
   */
  public formatTimestamp(message: any) {
    let timestamp = ""
    if(message.offsetSeconds < 3600) {
      timestamp = new Date(message.offsetSeconds * 1000).toISOString().substring(14, 19);
    } else {
      timestamp = new Date(message.offsetSeconds * 1000).toISOString().substring(11, 19);
    }
    return timestamp;
  }

  /**
   * Ouvre une VOD dans un nouvel onglet au timecode indiqué
   * @param video
   * @param offsetSecond
   */
  public async goToTimestamp(video: Video, offsetSecond: number) {
    // Récupère l'onglet actuel
    chrome.tabs.query({active: true, lastFocusedWindow: true}).then((tabs) => {
      // Envoie les infos de la VOD au service worker (background.js)
      chrome.runtime.sendMessage({ action: 'open', tabid: tabs[0].id, videoid: `${video.twitchid}`, offset: offsetSecond }, (response) => {
      });
    });
  }
}
