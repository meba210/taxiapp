export interface Taxi {
  id:number;
  PlateNo: number;
  PhoneNo: string;
  DriversName: string;
  LicenceNo: string;
  assignedRoute: string;  
}

export interface AssignedTaxi {
  PlateNo: number;
  from_route: string;
  to_route: string;
  time: string;
}