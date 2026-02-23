export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  lastLoginAt?: string;
}

export interface BoxFill {
  boxVolume: number;
  usedVolume: number;
  freeVolume: number;
  usedWeight: number;
  freeWeight: number;
  volumeFillPercent: number;
  weightFillPercent: number;
}

export interface Box {
  id: string;
  code: string;
  name: string;
  labelType: 'QR' | 'BARCODE';
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  maxWeightKg: number;
  location?: string;
  note?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DAMAGED';
  fill?: BoxFill;
  itemCount?: number;
  createdAt?: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  category?: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
  imagePath?: string;
  box?: { id: string; code: string; name: string; location?: string } | null;
  quantity?: number | null;
  createdAt?: string;
}

export interface BoxContents {
  box: Box;
  fill: BoxFill;
  items: (Item & { quantity: number; boxItemId: string })[];
}

export interface PackResult {
  ok: boolean;
  reasons?: { type: string; message: string }[];
  fill?: BoxFill;
  message?: string;
}

export interface RecommendResult {
  box: Box;
  fill: BoxFill;
  itemCount: number;
}

export interface StatsOverview {
  totalBoxes: number;
  activeBoxes: number;
  emptyBoxes: number;
  totalItems: number;
  totalUsedWeight: number;
  totalMaxWeight: number;
  avgVolumeFill: number;
  topBoxes: { box: Box; fill: BoxFill }[];
  categories: { name: string; count: number }[];
}
