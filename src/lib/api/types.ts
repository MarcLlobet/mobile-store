export interface ProductListItem {
  readonly id: string;
  readonly brand: string;
  readonly name: string;
  readonly basePrice: number;
  readonly imageUrl: string;
}

export interface ColorOption {
  readonly name: string;
  readonly hexCode: string;
  readonly imageUrl: string;
}

export interface StorageOption {
  readonly capacity: string;
  readonly price: number;
}

export interface ProductSpecs {
  readonly screen: string;
  readonly resolution: string;
  readonly processor: string;
  readonly mainCamera: string;
  readonly selfieCamera: string;
  readonly battery: string;
  readonly os: string;
  readonly screenRefreshRate: string;
}

export interface ProductDetail {
  readonly id: string;
  readonly brand: string;
  readonly name: string;
  readonly basePrice: number;
  readonly description: string;
  readonly rating: number;
  readonly specs: ProductSpecs;
  readonly colorOptions: readonly ColorOption[];
  readonly storageOptions: readonly StorageOption[];
  readonly similarProducts: readonly ProductListItem[];
}

export interface FetchProductsParams {
  readonly search?: string;
  readonly limit?: number;
  readonly offset?: number;
}

export interface ApiErrorBody {
  readonly error: string;
  readonly message: string;
}
