import { Routes } from '@angular/router';
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { EmployeeFormComponent } from './components/employee-form/employee-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: EmployeeDashboardComponent },
  { path: 'employees', component: EmployeeListComponent },
  { path: 'employees/new', component: EmployeeFormComponent },
  { path: 'employees/edit/:id', component: EmployeeFormComponent }
];
