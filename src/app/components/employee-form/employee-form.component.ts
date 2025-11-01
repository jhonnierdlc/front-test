import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService, Employee } from '../../services/employee.service';

@Component({
  selector: 'app-employee-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css'
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      position: [''],
      salary: ['', [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.employeeId = +params['id'];
        this.loadEmployee();
      }
    });
  }

  loadEmployee(): void {
    if (this.employeeId) {
      this.loading = true;
      this.employeeService.getEmployee(this.employeeId).subscribe({
        next: (employee) => {
          this.employeeForm.patchValue(employee);
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar el empleado';
          this.loading = false;
          console.error('Error:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.loading = true;
      this.error = null;

      // Preparar datos asegurando tipos correctos
      const formValue = this.employeeForm.value;
      const employeeData: Employee = {
        name: formValue.name?.trim() || '',
        position: formValue.position?.trim() || '',
        salary: formValue.salary ? Number(formValue.salary) : 0
      };

      // Si es modo edición, incluir el ID
      if (this.isEditMode && this.employeeId) {
        employeeData.id = this.employeeId;
      }

      console.log('Enviando datos:', employeeData);

      const operation = this.isEditMode
        ? this.employeeService.updateEmployee(this.employeeId!, employeeData)
        : this.employeeService.createEmployee(employeeData);

      operation.subscribe({
        next: (response) => {
          console.log('Respuesta exitosa:', response);
          this.router.navigate(['/employees']);
        },
        error: (error) => {
          this.error = this.isEditMode
            ? 'Error al actualizar el empleado'
            : 'Error al crear el empleado';
          this.loading = false;
          console.error('Error completo:', error);
        }
      });
    } else {
      console.log('Formulario inválido:', this.employeeForm.errors);
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.employeeForm.controls).forEach(key => {
        this.employeeForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.employeeForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors?.['minlength']) {
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors?.['min']) {
        return `${fieldName} debe ser mayor o igual a ${field.errors['min'].min}`;
      }
    }
    return null;
  }
}
