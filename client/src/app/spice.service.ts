import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Spice } from './spice';
import { Observable } from 'rxjs';
import { SERVER } from './server';
import { SPICE_TYPES } from './spice-types';
import { FilterService } from './filter.service';


@Injectable({
  providedIn: 'root'
})
export class SpiceService {
  constructor(private http: HttpClient, private filterService: FilterService) { }

  public getSpices(offset: number = 0, limit: number = 0): Observable<Spice[]> {
    console.log(SERVER);

    return new Observable<Spice[]>(subscriber => {
      this.http.get<any[]>(`${SERVER}spice${this.filterService.encodedQuery}&offset=${offset}&limit=${limit}`).subscribe(response => {
        const spices: Spice[] = response.map((val: any) => {
          return {
            label: val.label,
            type: SPICE_TYPES[val.type],
            printed: val.printed,
            _id: val._id,
            expirationDate: val.expiration_date,
            spicyLevel: val.spicy_level,
            toPrint: val.to_print,
            owner: val.owner,
            epicesDeCru: val.epices_de_cru === 1 ? true : false,
          }
        });
        subscriber.next(spices);
      });
    });
  }

  public getImageForSpice(_id: string): Observable<string> {
    return new Observable<string>(subscriber => {
      this.http.get<any>(SERVER + 'spice/image/' + _id).subscribe(response => {
        subscriber.next(response.url);
      });
    });
  }

  public getSpiceCount(): Observable<number> {
    return this.http.get<number>(`${SERVER}spice/count${this.filterService.encodedQuery}`);
  }

  public loadImages(label: string): Observable<string[]> {
    return this.http.get<string[]>(SERVER + 'spice/images/' + label);
  }

  public createSpice(spice: Spice, image: string): Observable<void> {
    return this.http.post<void>(
      SERVER + "spice/new",
      {
        spice: {
          label: spice.label,
          type: spice.type.value,
          to_print: spice.toPrint,
          owner: spice.owner,
          expiration_date: spice.expirationDate,
          spicy_level: spice.spicyLevel,
          printed: spice.printed,
          epices_de_cru: spice.epicesDeCru ? 1 : 0,
        }, 
        image_url: image
      },
      {headers: new HttpHeaders({'Content-Type': 'application/json'})}
    );
  }

  public deleteSpice(_id: string): Observable<void> {
    return this.http.delete<void>(
      SERVER + "spice/delete/" + _id,
    );
  }

  public updateSpice(_id: string, spice: Spice, image: string): Observable<void> {
    return this.http.put<void>(
      SERVER + "spice/update",
      {
        _id: _id,
        label: spice.label,
        type: spice.type.value,
        image: image,
        expiration_date: spice.expirationDate,
        spicy_level: spice.spicyLevel,
        to_print: spice.toPrint,
        printed: spice.printed,
        epices_de_cru: spice.epicesDeCru ? 1 : 0,
      },
      {headers: new HttpHeaders({'Content-Type': 'application/json'})}
    );
  }

  public addPrintedToSpice(_id: string, templateName: string): Observable<void> {
    return this.http.put<void>(
      SERVER + "spice/printed/update",
      {
        _id: _id,
        template_name: templateName,
      },
    );
  }

  public getImageContent(_id: string): Observable<string> {
    return this.http.get<string>(`${SERVER}spice/image/content/${_id}`);
  }
}
