
type Role='ADMIN'|'MAIN_HR'|'MAIN_HR_ASSISTANCE'|'HR'|'HR_ASSISTANCE'|'STUFF'|null;
type Status='ACTIVATED'|'DEACTIVATED'|'DEPARTED'|null;
export interface CheckAuth{
    status:Status;
    role:Role;
  }