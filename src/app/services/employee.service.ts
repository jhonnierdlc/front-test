import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Employee {
  id?: number;
  name: string;
  position?: string;
  salary?: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private apiUrl = 'http://localhost:5160/employees';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}
  getEmployees(): Observable<Employee[]> {
    console.log(this.apiUrl);
    return this.http
      .get<Employee[]>(this.apiUrl, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http
      .get<Employee>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  createEmployee(employee: Employee): Observable<Employee> {
    // Para crear, no incluir ID (se genera automáticamente)
    const { id, ...employeeData } = employee;
    console.log('Creando empleado:', employeeData);
    return this.http
      .post<Employee>(this.apiUrl, employeeData, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateEmployee(id: number, employee: Employee): Observable<any> {
    // Asegurar que el ID esté incluido en el body
    const employeeWithId = { ...employee, id: id };
    console.log('Actualizando empleado:', employeeWithId);
    return this.http
      .put(`${this.apiUrl}/${id}`, employeeWithId, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error completo:', error);
    console.error('Status:', error.status);
    console.error('Status Text:', error.statusText);
    console.error('URL:', error.url);
    console.error('Error message:', error.message);

    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error del servidor: ${error.status} - ${error.statusText}`;
      if (error.error && typeof error.error === 'string') {
        errorMessage += ` - ${error.error}`;
      }
    }

    console.error('Error procesado:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
