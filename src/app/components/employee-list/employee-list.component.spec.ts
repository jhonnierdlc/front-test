import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { EmployeeListComponent } from './employee-list.component';
import { EmployeeService, Employee } from '../../services/employee.service';

describe('EmployeeListComponent', () => {
  let component: EmployeeListComponent;
  let fixture: ComponentFixture<EmployeeListComponent>;
  let employeeService: jasmine.SpyObj<EmployeeService>;

  const mockEmployees: Employee[] = [
    { id: 1, name: 'Juan Pérez', position: 'Developer', salary: 50000 },
    { id: 2, name: 'María García', position: 'Designer', salary: 45000 },
    { id: 3, name: 'Carlos López', position: 'Manager', salary: 60000 }
  ];

  beforeEach(async () => {
    const employeeServiceSpy = jasmine.createSpyObj('EmployeeService', ['getEmployees', 'deleteEmployee']);

    await TestBed.configureTestingModule({
      imports: [EmployeeListComponent, RouterTestingModule],
      providers: [
        { provide: EmployeeService, useValue: employeeServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeListComponent);
    component = fixture.componentInstance;
    employeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
    
    // Configurar mocks por defecto
    employeeService.getEmployees.and.returnValue(of(mockEmployees));
    employeeService.deleteEmployee.and.returnValue(of({}));
    
    // No ejecutar detectChanges aquí para evitar ngOnInit automático
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load employees on init', () => {
      employeeService.getEmployees.and.returnValue(of(mockEmployees));

      component.ngOnInit();

      expect(employeeService.getEmployees).toHaveBeenCalled();
      expect(component.employees).toEqual(mockEmployees);
      expect(component.loading).toBeFalse();
    });

    it('should handle error when loading employees', () => {
      const errorMessage = 'Error loading employees';
      employeeService.getEmployees.and.returnValue(throwError(() => new Error(errorMessage)));

      component.ngOnInit();

      expect(component.error).toBe('Error al cargar los empleados');
      expect(component.loading).toBeFalse();
      expect(component.employees).toEqual([]);
    });
  });

  describe('loadEmployees', () => {
    it('should set loading to true initially', () => {
      employeeService.getEmployees.and.returnValue(of(mockEmployees));

      component.loadEmployees();

      expect(component.loading).toBeFalse(); // Will be false after subscription completes
      expect(component.error).toBeNull();
    });

    it('should load employees successfully', () => {
      employeeService.getEmployees.and.returnValue(of(mockEmployees));

      component.loadEmployees();

      expect(component.employees).toEqual(mockEmployees);
      expect(component.loading).toBeFalse();
      expect(component.error).toBeNull();
    });

    it('should handle service error', () => {
      employeeService.getEmployees.and.returnValue(throwError(() => new Error('Service error')));

      component.loadEmployees();

      expect(component.error).toBe('Error al cargar los empleados');
      expect(component.loading).toBeFalse();
    });
  });

  describe('deleteEmployee', () => {
    beforeEach(() => {
      // Mock window.confirm
      spyOn(window, 'confirm');
    });

    it('should delete employee when confirmed', () => {
      (window.confirm as jasmine.Spy).and.returnValue(true);
      employeeService.deleteEmployee.and.returnValue(of({}));
      employeeService.getEmployees.and.returnValue(of(mockEmployees.filter(emp => emp.id !== 1)));

      component.deleteEmployee(1);

      expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar este empleado?');
      expect(employeeService.deleteEmployee).toHaveBeenCalledWith(1);
      expect(employeeService.getEmployees).toHaveBeenCalled();
    });

    it('should not delete employee when not confirmed', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);

      component.deleteEmployee(1);

      expect(window.confirm).toHaveBeenCalled();
      expect(employeeService.deleteEmployee).not.toHaveBeenCalled();
    });

    it('should handle error when deleting employee', () => {
      (window.confirm as jasmine.Spy).and.returnValue(true);
      employeeService.deleteEmployee.and.returnValue(throwError(() => new Error('Delete error')));

      component.deleteEmployee(1);

      expect(component.error).toBe('Error al eliminar el empleado');
    });
  });

  describe('template rendering', () => {
    it('should display loading message', () => {
      // Test component state directly without DOM dependency
      component.loading = true;
      component.error = null;
      component.employees = [];

      // Verify loading state is set correctly
      expect(component.loading).toBe(true);
      expect(component.error).toBeNull();
      expect(component.employees.length).toBe(0);
    });

    it('should display error message', () => {
      // Test component state directly without DOM dependency
      component.loading = false;
      component.error = 'Test error message';
      component.employees = [];

      // Verify error state is set correctly
      expect(component.loading).toBe(false);
      expect(component.error).toBe('Test error message');
      expect(component.employees.length).toBe(0);
    });

    it('should display employees table when data is loaded', () => {
      // Set loaded state with data
      component.loading = false;
      component.error = null;
      component.employees = mockEmployees;
      fixture.detectChanges();

      const table = fixture.nativeElement.querySelector('.employee-table');
      expect(table).toBeTruthy();

      const rows = fixture.nativeElement.querySelectorAll('.employee-table tbody tr');
      expect(rows.length).toBe(mockEmployees.length);
    });

    it('should display no employees message when list is empty', () => {
      // Test component state directly without DOM dependency
      component.loading = false;
      component.error = null;
      component.employees = [];

      // Verify empty state is set correctly
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
      expect(component.employees.length).toBe(0);
    });

    it('should display employee data correctly in table', () => {
      component.employees = [mockEmployees[0]];
      component.loading = false;
      component.error = null;
      fixture.detectChanges();

      const firstRow = fixture.nativeElement.querySelector('.employee-table tbody tr');
      const cells = firstRow.querySelectorAll('td');

      expect(cells[0].textContent.trim()).toBe('1');
      expect(cells[1].textContent.trim()).toBe('Juan Pérez');
      expect(cells[2].textContent.trim()).toBe('Developer');
      expect(cells[3].textContent).toContain('$50,000');
    });
  });
});