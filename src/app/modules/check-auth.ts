
type Role='ADMIN'|'MAIN_HR'|'MAIN_HR_ASSISTANCE'|'HR'|'HR_ASSISTANCE'|'STUFF';
type Status='ACTIVATED'|'DEACTIVATED'|'DEPARTED';
export interface CheckAuth{
    status:Status;
    role:Role;
  }