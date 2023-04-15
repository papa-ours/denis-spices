import { Injectable } from '@angular/core';
import { SPICE_TYPES } from './spice-types';
import { SpiceType } from './spice-type';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  public label: string;
  public selectedPrinted: string[];
  public types: number[];
  public selectedToPrint: string[];
  public epicesDeCru: boolean;
  public others: boolean;
  public owner: string;
  constructor() {
    this.deleteFilter();
  }

  private selectAll(): void {
    this.types = SPICE_TYPES.map((type: SpiceType) => type.value);
  }

  public deleteFilter(): void {
    this.label = "";
    this.selectedToPrint = [];
    this.selectedPrinted = [];
    this.epicesDeCru = true;
    this.others = true;
    this.owner = "Denis";
    this.selectAll();
  }

  public get isBaseFilter(): boolean {
    return (
      this.types.length === SPICE_TYPES.length &&
      this.label === "" &&
      this.selectedToPrint.length === 0 &&
      this.selectedPrinted.length === 0 &&
      this.epicesDeCru &&
      this.others &&
      this.owner === "Denis"
    );
  }

  public get encodedQuery(): string {
    return `?label=${this.label}&type=${this.types.join(",")}&printed=${this.selectedPrinted.join(",")}&to_print=${this.selectedToPrint.join(",")}&owner=${this.owner}${this.all ? '' : `&epices_de_cru=${this.epicesDeCru ? 1 : 0}`}`;
  }

  public get all(): boolean {
    return this.epicesDeCru && this.others;
  }

  public get prettyFilter(): string {
    let filter: string = "";
    if (this.label) {
      filter += `Nom CONTIENT '${this.label}'`;
    }

    if (this.types.length) {
      if (filter.length) {
        filter += " ET "
      }
      filter += `Type PARMI ${this.typeLabels.join(", ")}`
    }

    if (this.selectedPrinted.length) {
      if (filter.length) {
        filter += " ET ";
      }
      filter += `Imprimé PARMI ${this.selectedPrinted.join(", ")}`; 
    }

    if (this.selectedToPrint.length) {
      if (filter.length) {
        filter += " ET ";
      }

      filter += `À imprimé PARMI ${this.selectedToPrint.join(", ")}`; 
    }

    if (!this.all) {
      filter += `${filter.length ? " ET PROVIENT DE " : ""}${this.epicesDeCru ? "Épices de cru" : "Autres"}`;
    }
    filter += `${filter.length ? " ET " : ""}Appartient à ${this.owner}`;

    return filter ? filter : "Aucun filtre";
  }

  private get typeLabels(): string[] {
    return this.types.map((value: number) => {
      return SPICE_TYPES.find((type: SpiceType) => type.value === value).label;
    });
  }
}
