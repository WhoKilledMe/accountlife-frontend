import { http } from "../lib/http";

export const keywordApi = {
  match: (keyword: string) => http.get(`/category-keywords/match`, { params: { keyword } }),
};


