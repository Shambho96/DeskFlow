export interface HotelSpecialRequest {
  id?: number;
  clientId?: number;
  outletId?: number | null;
  code: string;
  label: string;
  category: string;
  isChargeable: boolean;
  price: number;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

export interface HotelSpecialRequestInput {
  code: string;
  label: string;
  category?: string;
  isChargeable?: boolean;
  price?: number;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface HotelGuestTag {
  id?: number;
  clientId?: number;
  outletId?: number | null;
  name: string;
  color: string;
  category: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface HotelGuestTagInput {
  name: string;
  color?: string;
  category?: string;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}
