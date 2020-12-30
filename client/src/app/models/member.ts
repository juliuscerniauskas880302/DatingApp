import {Photo} from './photo';

export interface Member {
  id: number;
  username: string;
  photoUrl: string;
  age: number;
  knownAs: string;
  create: Date;
  lastActive: Date;
  gender: string;
  introduction: string;
  interests: string;
  country: string;
  photos: Photo[];
}

