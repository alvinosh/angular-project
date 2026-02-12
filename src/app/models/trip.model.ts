export interface TripsListQueryParams {
  sortBy: 'title' | 'price' | 'rating' | 'creationDate';
  sortOrder: 'ASC' | 'DESC';
  titleFilter: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  maxRating: number;
  tags: string; // comma-separated list of tags
  page: number;
  limit: number;
}

export interface TripsListResponse {
  items: Trip[];
  total: number;
  page: number;
  limit: number;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  nrOfRatings: number;
  verticalType: string;
  tags: string[];
  co2: number;
  thumbnailUrl: string;
  imageUrl: string;
  creationDate: string;
}
