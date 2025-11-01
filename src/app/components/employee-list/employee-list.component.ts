import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeService, Employee } from '../../services/employee.service';

@Component({
  selector: 'app-employee-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading = false;
  error: string | null = null;

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = null;
    
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los empleados';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  deleteEmployee(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (error) => {
          this.error = 'Error al eliminar el empleado';
          console.error('Error:', error);
        }
      });
    }
  }
}