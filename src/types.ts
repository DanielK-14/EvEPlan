export type GuestRelation = 'דניאל' | 'בר' | 'הורים דניאל' | 'הורים בר';
export type GuestStatus = 'Pending' | 'Arrived' | 'Not Arrived';

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  relatedTo: GuestRelation;
  isVegan: boolean;
  hasKids: boolean;
  kidsCount: number;
  phoneNumber: string;
  tableLabel: string;
  status: GuestStatus;
  giftAmount: number;
  relationGroupId?: string;
  rsvpLikelihood?: 'yes' | 'maybe' | 'no';
}

export interface AttractionService {
  id: string;
  name: string;
  price: number;
}

export interface FinanceConfig {
  dishPrice: number;
  attractions: AttractionService[];
}

export interface SharingRules {
  publicCanView: boolean;
  admins: string[];    // emails — full edit + sharing control
  viewers: string[];  // emails — read only
}

export interface EventDoc {
  id: string;
  title: string;
  description: string;
  location: string;
  createdByUid: string;
  sharingRules: SharingRules;
}
