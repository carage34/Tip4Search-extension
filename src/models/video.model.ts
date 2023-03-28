import {Message} from "./message.model";

export class Video {
  _id: string;
  name: string;
  thumbnail: string;
  postedAt: Date;
  messages: Message[];
  showSong: boolean = false;
  twitchid: string;
  available: boolean;
  youtubeid: string;
}
