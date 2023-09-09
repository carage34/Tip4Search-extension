/// <reference types="chrome"/>
import {Component, OnInit} from '@angular/core';
import {Video} from "../models/video.model";
import {VideoService} from "../services/video.service";
import {map, Observable, startWith} from "rxjs";
import {Message} from "../models/message.model";
import {Song} from "../models/song.model";
import {FormControl} from "@angular/forms";
import { MonthsEnum } from 'src/models/months.enum';
//import * as browser from 'webextension-polyfill';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-chrome-app';
  public artist: string[] = [];
  public songs: string[] = [];
  public videos: Video[];
  public messages: Message[] = [];
  public songPlayedList : Message[];
  public songChoose: string;
  public active: string = "songlist";
  public artistControl = new FormControl('');
  public nameControl = new FormControl('');
  public res = false;
  public monthsEnum = MonthsEnum;
  //public show = false;
  filteredOptions: Observable<string[]>;
  public monthList : any = [
  ]

  public monthArray2023 : any =     [
    {id:11, name: 'Décembre', videos: [], nbSong: 0},
    {id:10, name: 'Novembre', videos: [], nbSong: 0},
    {id:9, name: 'Octobre', videos: [], nbSong: 0},
    {id:8, name: 'Septembre', videos: [], nbSong: 0},
    {id: 7, name:'Août', videos: [], nbSong: 0},
    {id:6, name: 'Juillet', videos: [], nbSong: 0},
    {id:5, name: 'Juin', videos: [], nbSong: 0},
    {id:4, name: 'Mai', videos: [], nbSong: 0},
    {id:3, name: 'Avril', videos: [], nbSong: 0},
    {id:2, name: 'Mars', videos: [], nbSong: 0},
    {id:1, name:'Février', videos: [], nbSong: 0},
    {id: 0, name: 'Janvier', videos: [], nbSong: 0},
  ]

  public monthArray2022 : any =   [
    {id:11, name: 'Décembre', videos: [], nbSong: 0},
    {id:10, name: 'Novembre', videos: [], nbSong: 0},
    {id:9, name: 'Octobre', videos: [], nbSong: 0},
    {id:8, name: 'Septembre', videos: [], nbSong: 0},
    {id: 7, name:'Août', videos: [], nbSong: 0},
    {id:6, name: 'Juillet', videos: [], nbSong: 0},
    {id:5, name: 'Juin', videos: [], nbSong: 0},
    {id:4, name: 'Mai', videos: [], nbSong: 0},
    {id:3, name: 'Avril', videos: [], nbSong: 0},
    {id:2, name: 'Mars', videos: [], nbSong: 0},
    {id:1, name:'Février', videos: [], nbSong: 0},
    {id: 0, name: 'Janvier', videos: [], nbSong: 0},
  ]

  public year: any[] = []

  ngOnInit() {
    this.filteredOptions = this.artistControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  public selected() {
    this.videoService.getTitlesByArtist(this.artistControl.value || '').subscribe(songs => {
      this.songs = songs;
    });
  }

  public selectedSong(song: any) {
    this.showm(false);
    this.nameControl.setValue(song);
    let songPlayed = this.messages.filter(message => message.song?.name === song);
    for(let i=0; i< songPlayed.length;i++) {
      let video = this.videos.filter(video => video._id === songPlayed[i].video);
      if(typeof songPlayed[i].video === 'string') {
        songPlayed[i].video = video[0];
      }
    }
    this.songChoose = song;
    this.res = true;
    console.log(songPlayed);
    this.songPlayedList = songPlayed;
  }

  public getNumberOfTimePlayed(messages: Message[]) {
    return messages.length;
  }

  constructor(private videoService: VideoService) {
    // Logique récupération VODs et message des gagnants qui contient les morceaux joués
    videoService.getVideos().subscribe((videos: Video[]) => {
      this.videos = videos;
      this.getMessageByVideo(videos).subscribe(() => {
        console.log(this.videos);
        this.year.push({
          year: '2023',
          month: this.monthArray2023
        });
        this.year.push({
          year: '2022',
          month: this.monthArray2022
        })
        console.log(this.year)
        //this.monthArray2022.reverse();
        //this.monthArray2023.reverse();

      });
      // Afficher les VODs les plus récente
    });
  }

  public getMessageByVideo(video: Video[]) {
    return new Observable<any>((observer) => {
      for(let i = 0; i < video.length; i++) {
        this.getMessages(video[i]._id).subscribe(messages => {
          video[i].messages = messages;
          this.messages.push(...video[i].messages);
          // @ts-ignore
          //let year = video[i].postedAt.getFullYear();
          let date = new Date(video[i].postedAt);
          let year = date.getFullYear().toString()
          let month = date.getMonth();
          const monthObj = year === '2023' ? this.monthArray2023 : this.monthArray2022;
            let obj = monthObj.filter((item: any) => item.id === month)[0];
            obj.nbSong += messages.length;
            obj.videos.push(video[i]);
        })
      }
      observer.next();
      observer.complete();
    });
  }

  public getMonths(year:string) {
    //let month = this.year.filter((item: any) => item.year = year)[0].month;
    const monthObj = year === '2023' ? this.monthArray2023 : this.monthArray2022;
    //monthObj.reverse();
    return monthObj.filter((item: any) => item.videos.length > 0);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return filterValue === ''  ? this.artist : this.artist.filter(option => option.toLowerCase().includes(filterValue));
  }

  /**
   * Retourne les messages des gagnants qui contient les morceaux joués par videoid
   * @param id video
   */
  public getMessages(id: string) {
    return new Observable<Message[]>(observer => {
      this.videoService.getMessageByVideoId(id).subscribe((messages) => {
        observer.next(messages);
        messages.forEach(message => {
          if(message.song) {
            let isArtistExist = this.artist.filter(artist => artist === message.song.artist).length > 0;
            if(!isArtistExist) {
              this.artist.push(message.song.artist);
              this.artistControl.setValue(this.artist[0]);
            }
          }
        });
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
    /*browser.tabs.query({active: true, lastFocusedWindow: true}).then((tabs) => {
      // Envoie les infos de la VOD au service worker (background.js)
      let videoid = video.available ? video.twitchid : video.youtubeid ? video.youtubeid : '';
      chrome.runtime.sendMessage({ action: 'open', tabid: tabs[0].id, videoid: `${videoid}`, offset: offsetSecond, available: video.available }, (response) => {
      });
    }).catch((err) => {
      console.log(err);
    });*/
  }

  public artistSelected(artist: any) {
    this.show(false);
    this.nameControl.reset();
    this.artistControl.setValue(artist);
    this.videoService.getTitlesByArtist(this.artistControl.value || '').subscribe(songs => {
      let nameList = this.messages.map(message => message.song?.name);
      let songsCopy = songs;
      let songToDelete = [];
      for(let i = 0; i < songs.length; i++) {
        if(this.messages.filter(message => message.song?.name === songs[i]).length === 0) {
          /*console.log(songs[i])
          console.log("BEFORE");
          console.log(songs);
          console.log("AFTER");*/
          //console.log("Pas dedans");
          //console.log(songs[i]);
          songToDelete.push(songs[i]);
        }
      }
      songToDelete.forEach(song => {
        let toDelete = songsCopy.indexOf(song);
        songsCopy.splice(toDelete,1);
      })
      this.songs = songsCopy;
    })
  }

  public show(isShow: boolean) {
    if(isShow) {
      // @ts-ignore
      document.getElementById('autocomplete_result').style.display = 'block';
    } else {
      // @ts-ignore
      setTimeout(() => {
        // @ts-ignore
        document.getElementById('autocomplete_result').style.display = 'none';
      }, 200);
    }
  }

  public showm(isShow: boolean) {
    if(isShow) {
      // @ts-ignore
      document.getElementsByClassName('autocomplete_resultm')[0].style.display = 'block';
    } else {
      // @ts-ignore
      setTimeout(() => {
        // @ts-ignore
        document.getElementsByClassName('autocomplete_resultm')[0].style.display = 'none';
      }, 200);
    }
  }
}
