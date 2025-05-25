
export interface Customer {
  id: string;
  name: string;
  accountNumber: string;
  groupCode: string;
  branch: string;
  principle: number;
  status: "จบ" | "ไม่จบ";
  brand: string;
  model: string;
  licensePlate: string;
  resus: "CURED" | "DR" | "REPO" | "ตบเด้ง";
  authorizationDate: string;
  commission: number;
  registrationId: string;
  workGroup: "6090" | "NPL";
  fieldTeam: string;
  installment: number;
  initialBucket: string;
  currentBucket: string;
  cycleDay: string;
  engineNumber: string;
  blueBookPrice: number;
  address: string;
  latitude: number;
  longitude: number;
  hubCode: string;
  workStatus: string;
  lastVisitResult: string;
  team: string;
  distance?: number; // Added optional distance property
}

export type CustomerFormData = Omit<Customer, "id"> & {
  id?: string;
  phoneNumbers?: string[];
  notes?: string;
};

export interface CustomerFilter {
  searchTerm: string;
  workGroup: string[];
  branch: string[];
  status: string[];
  cycleDay: string[];
  resus: string[];
  team: string[]; // Added team to filter options
}
