export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export type ReservationType = {
  userId: string;
  tenantId: string;
  tableId: string;

  customer: {
    fullname: string;
    phone: string;
    email?: string;
  };

  startAt: Date;

  endAt: Date;
  // ISO date (2025-01-20T18:30:00Z)

  status: ReservationStatus;

  note?: string;

  metadata: {
    occasion?: 'birthday' | 'anniversary' | 'business' | 'dinner';
    preferences?: string;
  };
};
