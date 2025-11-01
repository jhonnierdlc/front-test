import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeService, Employee } from './employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  const mockEmployees: Employee[] = [
    { id: 1, name: 'Juan Pérez', position: 'Developer', salary: 50000 },
    { id: 2, name: 'María García', position: 'Designer', salary: 45000 }
  ];

  const mockEmployee: Employee = { id: 1, name: 'Juan Pérez', position: 'Developer', salary: 50000 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmployeeService]
    });
    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getEmployees', () => {
    it('should return an Observable<Employee[]>', () => {
      service.getEmployees().subscribe(employees => {
        expect(employees.length).toBe(2);
        expect(employees).toEqual(mockEmployees);
      });

      const req = httpMock.expectOne('/api/employees');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      req.flush(mockEmployees);
    });

    it('should handle error when getting employees', () => {
      service.getEmployees().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.message).toContain('Error del servidor: 500');
        }
      });

      const req = httpMock.expectOne('/api/employees');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getEmployee', () => {
    it('should return a single employee', () => {
      const employeeId = 1;

      service.getEmployee(employeeId).subscribe(employee => {
        expect(employee).toEqual(mockEmployee);
      });

      const req = httpMock.expectOne(`/api/employees/${employeeId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEmployee);
    });

    it('should handle 404 error when employee not found', () => {
      const employeeId = 999;

      service.getEmployee(employeeId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.message).toContain('Error del servidor: 404');
        }
      });

      const req = httpMock.expectOne(`/api/employees/${employeeId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createEmployee', () => {
    it('should create a new employee', () => {
      const newEmployee: Employee = { name: 'Carlos López', position: 'Manager', salary: 60000 };
      const createdEmployee: Employee = { id: 3, ...newEmployee };

      service.createEmployee(newEmployee).subscribe(employee => {
        expect(employee).toEqual(createdEmployee);
      });

      const req = httpMock.expectOne('/api/employees');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newEmployee);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(createdEmployee);
    });

    it('should handle validation error when creating employee', () => {
      const invalidEmployee: Employee = { name: '', position: 'Developer', salary: 50000 };

      service.createEmployee(invalidEmployee).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error) => {
          expect(error.message).toContain('Error del servidor: 400');
        }
      });

      const req = httpMock.expectOne('/api/employees');
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateEmployee', () => {
    it('should update an existing employee', () => {
      const employeeId = 1;
      const updatedEmployee: Employee = { id: 1, name: 'Juan Pérez Updated', position: 'Senior Developer', salary: 55000 };

      service.updateEmployee(employeeId, updatedEmployee).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`/api/employees/${employeeId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ ...updatedEmployee, id: employeeId });
      req.flush(updatedEmployee);
    });

    it('should handle error when updating non-existent employee', () => {
      const employeeId = 999;
      const updatedEmployee: Employee = { name: 'Non Existent', position: 'Developer', salary: 50000 };

      service.updateEmployee(employeeId, updatedEmployee).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.message).toContain('Error del servidor: 404');
        }
      });

      const req = httpMock.expectOne(`/api/employees/${employeeId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteEmployee', () => {
    it('should delete an employee', () => {
      const employeeId = 1;

      service.deleteEmployee(employeeId).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`/api/employees/${employeeId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Employee deleted successfully' });
    });

    it('should handle error when deleting non-existent employee', () => {
      const employeeId = 999;

      service.deleteEmployee(employeeId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.message).toContain('Error del servidor: 404');
        }
      });

      const req = httpMock.expectOne(`/api/employees/${employeeId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });
});