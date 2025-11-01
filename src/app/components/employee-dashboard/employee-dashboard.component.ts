import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeService, Employee } from '../../services/employee.service';

@Component({
  selector: 'app-employee-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css'
})
export class EmployeeDashboardComponent implements OnInit {
  totalEmployees = 0;
  averageSalary = 0;
  recentEmployees: Employee[] = [];
  loading = false;

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.totalEmployees = employees.length;
        this.calculateAverageSalary(employees);
        this.recentEmployees = employees.slice(-5).reverse(); // Últimos 5 empleados
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private calculateAverageSalary(employees: Employee[]): void {
    if (employees.length === 0) {
      this.averageSalary = 0;
      return;
    }
    
    const totalSalary = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    this.averageSalary = totalSalary / employees.length;
  }
}
