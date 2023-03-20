import {Video} from "./video.model";
import {Song} from "./song.model";

export class Message {
  _id: string;
  video: Video;
  winner: String[];
  postedAt: Date;
  done: boolean;
  offsetSeconds: number;
  song: Song;
}
