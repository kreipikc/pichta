export interface WantedProfessionCreateI {
  id_profession: number;
}

export interface WantedProfessionI {
  id_user: number;
  id_profession: number;
  profession: {
    name: string;
    lvl: string;
    id: number;
  };
}