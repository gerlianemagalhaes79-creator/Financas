export interface FixedBill {
  id: string;
  ownerId: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  dueDate: number; // Day of the month (1-31)
  category: string;
  createdAt: any; // Firestore Timestamp
  startMonth?: number; // Starting month (0-11)
  startYear?: number;  // Starting year
}

export interface CreditCard {
  id: string;
  ownerId: string;
  name: string;
  limit: number;
  closingDay: number; // Closing day of invoice (1-31)
  dueDay: number; // Due day of invoice (1-31)
  color: string; // Tailwind class description or HEX color
  last4: string; // last 4 digits
  createdAt: any; // Firestore Timestamp
}

export interface Transaction {
  id: string;
  ownerId: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  date: string; // YYYY-MM-DD
  category: string;
  cardId: string | null; // Null if paid with cash, debit, or was a direct bank transfer
  billId: string | null; // Null, or the ID of the FixedBill this transaction paid
  isPaid: boolean;
  createdAt: any; // Firestore Timestamp
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
