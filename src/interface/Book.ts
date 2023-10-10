import { User } from "./User";

export interface Book {
  isPublic: false;
  logo: string;
  name: string;
  noVerify: boolean;
  role: number | null;
  showInHomePage: boolean;
  updateTime: number;
  _key: string;
  hasFav: boolean;
  lock: boolean;
  creatorInfo: any;
  defaultRole: number;
  tagKey: string;
  tagInfo?: any;
  rootKey: string;
  //0 待审核,1 同意,2 拒绝
  needReply?: number;
  hasChild: boolean;
  memberCount: number;
}
export interface BookDetail {
  creatorInfo: User;
  defaultRole: number;
  isPublic: boolean;
  lock: boolean;
  logo: string;
  memberCount: number;
  name: string;
  noVerify: boolean;
  role: number | null;
  rootKey: string;
  showInHomePage: boolean;
  spaceKey: string;
  updateTime: number;
  userKey: string;
  tagKey: string;
  tagInfo: {
    defaultView: number;
    name: string;
    _key: string;
  };
  _key: string;
}
export interface Member {
  role: number;
  userAvatar: string;
  userKey: string;
  userName: string;
}
