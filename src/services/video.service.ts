import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Video} from "../models/video.model";
import {Message} from "../models/message.model";

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  public API_URL = "http://localhost:4000/api";

  constructor(private http: HttpClient) { }

  public getVideos() : Observable<Video[]> {
    return this.http.get<Video[]>(`${this.API_URL}/videos`);
  }

  public getMessageByVideoId(id: string) {
    return this.http.get<Message[]>(`${this.API_URL}/messages/${id}`);
  }

  public replaceUrl(video: Video) : Video {
    video.thumbnail = video.thumbnail.replace("%{width}", "350");
    video.thumbnail = video.thumbnail.replace("%{height}", "200");
    return video;
  }
}
