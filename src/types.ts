export type Message = {
  text: string;
  sender: 'user' | 'bot';
};

export type UserInfo = {
  name: string;
  age: string;
  gender: string;
};

export type SymptomEntry = {
  symptoms: string;
  specialist: string;
  keywords: string[];
};