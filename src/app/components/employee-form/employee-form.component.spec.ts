import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EmployeeFormComponent } from './employee-form.component';
import { EmployeeService, Employee } from '../../services/employee.service';

describe('EmployeeFormComponent', () => {
  let component: EmployeeFormComponent;
  let fixture: ComponentFixture<EmployeeFormComponent>;
  let employeeService: jasmine.SpyObj<EmployeeService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  const mockEmployee: Employee = {
    id: 1,
    name: 'Juan Pérez',
    position: 'Developer',
    salary: 50000
  };

  beforeEach(async () => {
    const employeeServiceSpy = jasmine.createSpyObj('EmployeeService', ['getEmployee', 'createEmployee', 'updateEmployee']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [EmployeeFormComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: EmployeeService, useValue: employeeServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeFormComponent);
    component = fixture.componentInstance;
    employeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Configurar mocks por defecto
    employeeService.getEmployee.and.returnValue(of(mockEmployee));
    employeeService.createEmployee.and.returnValue(of(mockEmployee));
    employeeService.updateEmployee.and.returnValue(of(mockEmployee));
    
    // No ejecutar detectChanges aquí para evitar ngOnInit automático
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values for create mode', () => {
      activatedRoute.params = of({});
      component.ngOnInit();

      expect(component.isEditMode).toBeFalse();
      expect(component.employeeForm.get('name')?.value).toBe('');
      expect(component.employeeForm.get('position')?.value).toBe('');
      expect(component.employeeForm.get('salary')?.value).toBe('');
    });

    it('should set edit mode when id parameter is present', () => {
      employeeService.getEmployee.and.returnValue(of(mockEmployee));
      
      component.ngOnInit();

      expect(component.isEditMode).toBeTrue();
      expect(component.employeeId).toBe(1);
      expect(employeeService.getEmployee).toHaveBeenCalledWith(1);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should be invalid when name is empty', () => {
      component.employeeForm.patchValue({
        name: '',
        position: 'Developer',
        salary: 50000
      });

      expect(component.employeeForm.invalid).toBeTrue();
      expect(component.employeeForm.get('name')?.hasError('required')).toBeTrue();
    });

    it('should be invalid when name is too short', () => {
      component.employeeForm.patchValue({
        name: 'A',
        position: 'Developer',
        salary: 50000
      });

      expect(component.employeeForm.invalid).toBeTrue();
      expect(component.employeeForm.get('name')?.hasError('minlength')).toBeTrue();
    });

    it('should be invalid when salary is negative', () => {
      component.employeeForm.patchValue({
        name: 'Juan Pérez',
        position: 'Developer',
        salary: -1000
      });

      expect(component.employeeForm.invalid).toBeTrue();
      expect(component.employeeForm.get('salary')?.hasError('min')).toBeTrue();
    });

    it('should be valid with correct data', () => {
      component.employeeForm.patchValue({
        name: 'Juan Pérez',
        position: 'Developer',
        salary: 50000
      });

      expect(component.employeeForm.valid).toBeTrue();
    });
  });

  describe('loadEmployee', () => {
    beforeEach(() => {
      component.employeeId = 1;
    });

    it('should load employee data successfully', () => {
      employeeService.getEmployee.and.returnValue(of(mockEmployee));

      component.loadEmployee();

      expect(component.loading).toBeFalse();
      expect(component.employeeForm.get('name')?.value).toBe(mockEmployee.name);
      expect(component.employeeForm.get('position')?.value).toBe(mockEmployee.position);
      expect(component.employeeForm.get('salary')?.value).toBe(mockEmployee.salary);
    });

    it('should handle error when loading employee', () => {
      employeeService.getEmployee.and.returnValue(throwError(() => new Error('Load error')));

      component.loadEmployee();

      expect(component.error).toBe('Error al cargar el empleado');
      expect(component.loading).toBeFalse();
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should create employee when in create mode', () => {
      component.isEditMode = false;
      component.employeeForm.patchValue({
        name: 'Juan Pérez',
        position: 'Developer',
        salary: 50000
      });
      employeeService.createEmployee.and.returnValue(of(mockEmployee));

      component.onSubmit();

      expect(employeeService.createEmployee).toHaveBeenCalledWith({
        name: 'Juan Pérez',
        position: 'Developer',
        salary: 50000
      });
      expect(router.navigate).toHaveBeenCalledWith(['/employees']);
    });

    it('should update employee when in edit mode', () => {
      component.isEditMode = true;
      component.employeeId = 1;
      component.employeeForm.patchValue({
        name: 'Juan Pérez Updated',
        position: 'Senior Developer',
        salary: 55000
      });
      employeeService.updateEmployee.and.returnValue(of(mockEmployee));

      component.onSubmit();

      expect(employeeService.updateEmployee).toHaveBeenCalledWith(1, {
        id: 1,
        name: 'Juan Pérez Updated',
        position: 'Senior Developer',
        salary: 55000
      });
      expect(router.navigate).toHaveBeenCalledWith(['/employees']);
    });

    it('should handle create error', () => {
      component.isEditMode = false;
      component.employeeForm.patchValue({
        name: 'Juan Pérez',
        position: 'Developer',
        salary: 50000
      });
      employeeService.createEmployee.and.returnValue(throwError(() => new Error('Create error')));

      component.onSubmit();

      expect(component.error).toBe('Error al crear el empleado');
      expect(component.loading).toBeFalse();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle update error', () => {
      component.isEditMode = true;
      component.employeeId = 1;
      component.employeeForm.patchValue({
        name: 'Juan Pérez',
        position: 'Developer',
        salary: 50000
      });
      employeeService.updateEmployee.and.returnValue(throwError(() => new Error('Update error')));

      component.onSubmit();

      expect(component.error).toBe('Error al actualizar el empleado');
      expect(component.loading).toBeFalse();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not submit when form is invalid', () => {
      component.employeeForm.patchValue({
        name: '', // Invalid - required
        position: 'Developer',
        salary: 50000
      });

      component.onSubmit();

      expect(employeeService.createEmployee).not.toHaveBeenCalled();
      expect(employeeService.updateEmployee).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should navigate to employees list', () => {
      component.onCancel();

      expect(router.navigate).toHaveBeenCalledWith(['/employees']);
    });
  });

  describe('getFieldError', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should return required error message', () => {
      const nameControl = component.employeeForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();

      const error = component.getFieldError('name');

      expect(error).toBe('name es requerido');
    });

    it('should return minlength error message', () => {
      const nameControl = component.employeeForm.get('name');
      nameControl?.setValue('A');
      nameControl?.markAsTouched();

      const error = component.getFieldError('name');

      expect(error).toBe('name debe tener al menos 2 caracteres');
    });

    it('should return min error message for salary', () => {
      const salaryControl = component.employeeForm.get('salary');
      salaryControl?.setValue(-100);
      salaryControl?.markAsTouched();

      const error = component.getFieldError('salary');

      expect(error).toBe('salary debe ser mayor o igual a 0');
    });

    it('should return null when field is valid', () => {
      const nameControl = component.employeeForm.get('name');
      nameControl?.setValue('Juan Pérez');
      nameControl?.markAsTouched();

      const error = component.getFieldError('name');

      expect(error).toBeNull();
    });

    it('should return null when field is not touched', () => {
      const nameControl = component.employeeForm.get('name');
      nameControl?.setValue('');
      // Not marking as touched

      const error = component.getFieldError('name');

      expect(error).toBeNull();
    });
  });
});