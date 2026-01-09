export interface Taxi {
  id: number;
  PlateNo: number;
  PhoneNo: string;
  DriversName: string;
  LicenceNo: string;
  assignedRoute: string;
  isQueued: number;
}

export interface AssignedTaxi {
  PlateNo: number;
  from_route: string;
  to_route: string;
  time: string;
}

export interface TaxiAssignment {
  id: number;
  plateNo: string;
  fromRoute: string;
  toRoute: string;
  status: 'available' | 'busy' | 'assigned' | string;
  time: string;
}

export interface NotificationResponse {
  success: boolean;
  notifications: TaxiAssignment[];
}
