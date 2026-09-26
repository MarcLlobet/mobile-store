export interface ProductListItem {
  id: string;
  brand: string;
  name: string;
  basePrice: number;
  imageUrl: string;
}

export interface ColorOption {
  name: string;
  hexCode: string;
  imageUrl: string;
}

export interface StorageOption {
  capacity: string;
  price: number;
}

export interface ProductSpecs {
  screen: string;
  resolution: string;
  processor: string;
  mainCamera: string;
  selfieCamera: string;
  battery: string;
  os: string;
  screenRefreshRate: string;
}

export interface ProductDetail {
  id: string;
  brand: string;
  name: string;
  basePrice: number;
  description: string;
  rating: number;
  specs: ProductSpecs;
  colorOptions: readonly ColorOption[];
  storageOptions: readonly StorageOption[];
  similarProducts: readonly ProductListItem[];
}

export interface FetchProductsParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ApiErrorBody {
  error: string;
  message: string;
}
