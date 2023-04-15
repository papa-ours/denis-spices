import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SERVER } from './server';
import { TemplateParams } from './template-params';
@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  public constructor(private http: HttpClient) { }

  public saveTemplate(params: TemplateParams): Observable<void> {
    return this.http.post<void>(`${SERVER}template`, params);
  }

  public updateTemplate(params: TemplateParams): Observable<void> {
    return this.http.put<void>(`${SERVER}template`, params);
  }

  public getTemplates(): Observable<TemplateParams[]> {
    return this.http.get<TemplateParams[]>(`${SERVER}templates`);
  }

  public deleteTemplate(_id: string): Observable<void> {
    return this.http.delete<void>(`${SERVER}template/${_id}`);
  }
}
