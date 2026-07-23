export interface SearchSuggestion {
  id: string;
  title: string;
  image?: string;
  category?: string;
}

export interface RecentSearch {
  id: string;
  text: string;
}

export interface TrendingSearch {
  id: string;
  text: string;
}