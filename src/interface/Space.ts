import { Book } from "./Book";
import { Person, User } from "./User";

export interface Space {
  creatorInfo: Person;
  memberCount: number;
  name: string;
  role: number;
  logo?: string;
  _key: string;
}
export interface SpaceDetail {
  bookList: Book[];
  role: number;
  spaceInfo: {
    logo: string;
    name: string;
    _key: string;
    memberCount: number;
    ownerInfo: User;
  };
}

export interface SpaceMember {
  mobile: string;
  role: number;
  userAvatar: null | string;
  userKey: string;
  userName: null | string;
}
