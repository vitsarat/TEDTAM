
import { Customer } from "@/types/customer";

const initialCustomers: Customer[] = [
  {
    "id": "1",
    "name": "สมชาย ใจดี",
    "accountNumber": "1234567890",
    "groupCode": "G1",
    "branch": "สาขาสุขุมวิท",
    "principle": 100000,
    "status": "ไม่จบ",
    "brand": "Toyota",
    "model": "Camry",
    "licensePlate": "1กท1234",
    "resus": "CURED",
    "authorizationDate": "05/05/2025",
    "commission": 5000,
    "registrationId": "REG001",
    "workGroup": "6090",
    "fieldTeam": "ทีม A",
    "installment": 5000,
    "initialBucket": "B1",
    "currentBucket": "B2",
    "cycleDay": "15",
    "engineNumber": "ABC123456",
    "blueBookPrice": 800000,
    "address": "123 ถ.สุขุมวิท กรุงเทพฯ 10110",
    "latitude": 13.7563,
    "longitude": 100.5018,
    "hubCode": "BKK01",
    "workStatus": "ลงพื้นที่",
    "lastVisitResult": "พบลูกค้า นัดชำระ",
    "team": "ทีม A"
  },
  {
    "id": "2",
    "name": "สมหญิง จริงใจ",
    "accountNumber": "9876543210",
    "groupCode": "G2",
    "branch": "สาขาสยาม",
    "principle": 200000,
    "status": "จบ",
    "brand": "Honda",
    "model": "Civic",
    "licensePlate": "2ขข5678",
    "resus": "DR",
    "authorizationDate": "10/05/2025",
    "commission": 10000,
    "registrationId": "REG002",
    "workGroup": "NPL",
    "fieldTeam": "ทีม B",
    "installment": 8000,
    "initialBucket": "B2",
    "currentBucket": "B3",
    "cycleDay": "10",
    "engineNumber": "DEF789012",
    "blueBookPrice": 750000,
    "address": "456 ถ.พระราม 1 กรุงเทพฯ 10330",
    "latitude": 13.7466,
    "longitude": 100.5331,
    "hubCode": "BKK02",
    "workStatus": "จบงาน",
    "lastVisitResult": "ชำระเรียบร้อยแล้ว",
    "team": "ทีม B"
  },
  {
    "id": "3",
    "name": "Somsak Rakdee",
    "accountNumber": "5555555555",
    "groupCode": "G1",
    "branch": "สาขาสุขุมวิท",
    "principle": 150000,
    "status": "ไม่จบ",
    "brand": "Mazda",
    "model": "3",
    "licensePlate": "3คค9012",
    "resus": "REPO",
    "authorizationDate": "15/05/2025",
    "commission": 7500,
    "registrationId": "REG003",
    "workGroup": "6090",
    "fieldTeam": "ทีม A",
    "installment": 5000,
    "initialBucket": "B1",
    "currentBucket": "B2",
    "cycleDay": "15",
    "engineNumber": "ABC123456",
    "blueBookPrice": 800000,
    "address": "123 ถ.สุขุมวิท กรุงเทพฯ 10110",
    "latitude": 13.7563,
    "longitude": 100.5018,
    "hubCode": "BKK01",
    "workStatus": "ลงพื้นที่",
    "lastVisitResult": "พบลูกค้า นัดชำระ",
    "team": "ทีม A"
  },
  {
    "id": "4",
    "name": "Somjai Dee Mak",
    "accountNumber": "1111111111",
    "groupCode": "G3",
    "branch": "สาขาบางนา",
    "principle": 250000,
    "status": "จบ",
    "brand": "Ford",
    "model": "Ranger",
    "licensePlate": "4งง3456",
    "resus": "ตบเด้ง",
    "authorizationDate": "20/05/2025",
    "commission": 12500,
    "registrationId": "REG004",
    "workGroup": "NPL",
    "fieldTeam": "ทีม B",
    "installment": 8000,
    "initialBucket": "B2",
    "currentBucket": "B3",
    "cycleDay": "10",
    "engineNumber": "DEF789012",
    "blueBookPrice": 750000,
    "address": "456 ถ.พระราม 1 กรุงเทพฯ 10330",
    "latitude": 13.7466,
    "longitude": 100.5331,
    "hubCode": "BKK02",
    "workStatus": "จบงาน",
    "lastVisitResult": "ชำระเรียบร้อยแล้ว",
    "team": "ทีม B"
  },
  {
    "id": "5",
    "name": "สมนึก ใจมั่น",
    "accountNumber": "2222222222",
    "groupCode": "G2",
    "branch": "สาขาสยาม",
    "principle": 120000,
    "status": "ไม่จบ",
    "brand": "Isuzu",
    "model": "D-Max",
    "licensePlate": "5จจ7890",
    "resus": "CURED",
    "authorizationDate": "25/05/2025",
    "commission": 6000,
    "registrationId": "REG005",
    "workGroup": "6090",
    "fieldTeam": "ทีม A",
    "installment": 5000,
    "initialBucket": "B1",
    "currentBucket": "B2",
    "cycleDay": "15",
    "engineNumber": "ABC123456",
    "blueBookPrice": 800000,
    "address": "123 ถ.สุขุมวิท กรุงเทพฯ 10110",
    "latitude": 13.7563,
    "longitude": 100.5018,
    "hubCode": "BKK01",
    "workStatus": "ลงพื้นที่",
    "lastVisitResult": "พบลูกค้า นัดชำระ",
    "team": "ทีม A"
  },
  {
    "id": "6",
    "name": "สมปอง รักไทย",
    "accountNumber": "3333333333",
    "groupCode": "G3",
    "branch": "สาขาบางนา",
    "principle": 180000,
    "status": "จบ",
    "brand": "Mitsubishi",
    "model": "Triton",
    "licensePlate": "6ฉฉ1234",
    "resus": "DR",
    "authorizationDate": "30/05/2025",
    "commission": 9000,
    "registrationId": "REG006",
    "workGroup": "NPL",
    "fieldTeam": "ทีม B",
    "installment": 8000,
    "initialBucket": "B2",
    "currentBucket": "B3",
    "cycleDay": "10",
    "engineNumber": "DEF789012",
    "blueBookPrice": 750000,
    "address": "456 ถ.พระราม 1 กรุงเทพฯ 10330",
    "latitude": 13.7466,
    "longitude": 100.5331,
    "hubCode": "BKK02",
    "workStatus": "จบงาน",
    "lastVisitResult": "ชำระเรียบร้อยแล้ว",
    "team": "ทีม B"
  }
];

class CustomerService {
  private customers: Customer[] = [...initialCustomers];

  getCustomers(): Customer[] {
    return this.customers;
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers.find(customer => customer.id === id);
  }

  addCustomer(customer: Omit<Customer, "id">): Customer {
    const newCustomer = {
      ...customer,
      id: (this.customers.length + 1).toString()
    };
    this.customers.push(newCustomer);
    return newCustomer;
  }

  updateCustomer(id: string, customer: Partial<Customer>): Customer | undefined {
    const index = this.customers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.customers[index] = { ...this.customers[index], ...customer };
      return this.customers[index];
    }
    return undefined;
  }

  deleteCustomer(id: string): boolean {
    const initialLength = this.customers.length;
    this.customers = this.customers.filter(customer => customer.id !== id);
    return this.customers.length < initialLength;
  }

  // Filter customers by various criteria
  filterCustomers(filters: {
    searchTerm?: string;
    workGroup?: string | string[];
    branch?: string | string[];
    status?: string | string[];
    cycleDay?: string | string[];
    resus?: string | string[];
    team?: string | string[];
  }): Customer[] {
    return this.customers.filter(customer => {
      let matches = true;

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const nameMatches = customer.name.toLowerCase().includes(searchLower);
        const accountNumberMatches = customer.accountNumber.includes(filters.searchTerm);
        const hubCodeMatches = customer.hubCode.includes(filters.searchTerm);
        matches = matches && (nameMatches || accountNumberMatches || hubCodeMatches);
      }

      if (filters.workGroup) {
        const workGroups = Array.isArray(filters.workGroup) ? filters.workGroup : [filters.workGroup];
        if (workGroups.length > 0 && !workGroups.includes('all')) {
          matches = matches && workGroups.includes(customer.workGroup);
        }
      }

      if (filters.branch) {
        const branches = Array.isArray(filters.branch) ? filters.branch : [filters.branch];
        if (branches.length > 0 && !branches.includes('all')) {
          matches = matches && branches.includes(customer.branch);
        }
      }

      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        if (statuses.length > 0 && !statuses.includes('all')) {
          matches = matches && statuses.includes(customer.status);
        }
      }

      if (filters.cycleDay) {
        const cycleDays = Array.isArray(filters.cycleDay) ? filters.cycleDay : [filters.cycleDay];
        if (cycleDays.length > 0 && !cycleDays.includes('all')) {
          matches = matches && cycleDays.includes(customer.cycleDay);
        }
      }

      if (filters.resus) {
        const resuses = Array.isArray(filters.resus) ? filters.resus : [filters.resus];
        if (resuses.length > 0 && !resuses.includes('all')) {
          matches = matches && resuses.includes(customer.resus);
        }
      }
      
      // Added team filter support
      if (filters.team) {
        const teams = Array.isArray(filters.team) ? filters.team : [filters.team];
        if (teams.length > 0 && !teams.includes('all')) {
          matches = matches && teams.includes(customer.team);
        }
      }

      return matches;
    });
  }
}

export const customerService = new CustomerService();
