import { Component, OnInit, HostListener } from '@angular/core';
import { Spice } from '../spice';
import { SpiceService } from '../spice.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SPICE_TYPES } from '../spice-types';
import { EditComponent } from '../edit/edit.component';
import { ModalController, ToastController, Platform } from '@ionic/angular';
import { FilterComponent } from '../filter/filter.component';
import { PrintComponent } from '../print/print.component';
import { FilterService } from '../filter.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  public readonly SPICE_PER_PAGE: number = 24;
  public sortColumn: string;
  public sortDirection: number;
  public spices: Spice[];
  public activeSpices: Spice[];
  public pageCount: number;
  public currentPage: number;
  public loading: boolean;
  public width: number;

  constructor(
    private service: SpiceService,
    private router: Router,
    private modalCtrl: ModalController,
    public filterService: FilterService,
    private toastController: ToastController,
    private platform: Platform,
  ) {
    this.spices = [];
    this.activeSpices = [];
    this.sortColumn = "label";
    this.sortDirection = 1;
    this.initPages();
    this.loading = false;
  }

  public ngOnInit(): void {
    this.getSpices();
    this.width = this.platform.width();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe(
      () => this.getSpices()
    );
  }

  @HostListener('window:resize', ['$event'])
  public onResize(): void {
    this.width = this.platform.width();
  }

  public initPages(): void {
    this.currentPage = 0;
    this.getPageCount();
  }

  public getPageCount(): void {
    this.service.getSpiceCount().subscribe((count: number) => this.pageCount = count ? Math.ceil(count / this.SPICE_PER_PAGE) : 1);
  }

  public changePage(change: number): void {
    this.currentPage += change;
    if (this.currentPage === this.pageCount) {
      this.currentPage = this.pageCount;
    }
    if (this.currentPage < 0) {
      this.currentPage = 0;
    }
  }

  public setSort(column: string): void {
    this.sortColumn = column;
    this.sortDirection = this.sortDirection === -1 ? 1 : -1;
    this.sortSpices();
  }

  private async showToast(message: string): Promise<void> {
    const toast: HTMLIonToastElement = await this.toastController.create({
      message: message,
      duration: 2200,
      position: 'bottom',
      color: 'danger',
      showCloseButton: true,
      closeButtonText: 'OK',
    });

    toast.present();
  }

  private sortSpices(): void {
    this.activeSpices.sort((spice1: Spice, spice2: Spice) => {
      const val1: string = (this.sortColumn === 'label' ? spice1.label : this.sortColumn === 'printed' ? spice1.printed.toString() : spice1.type.label).replace('É', 'E');
      const val2: string = (this.sortColumn === 'label' ? spice2.label : this.sortColumn === 'printed' ? spice2.printed.toString() : spice2.type.label).replace('É', 'E');

      if (this.sortDirection === -1) {
        return val1 < val2 ? 1 : -1;
      } else {
        return val1 < val2 ? -1 : 1 ;
      }
    });
  }

  public async addSpice(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: EditComponent,
      keyboardClose: true,
      componentProps: {
        isAdd: true,
        spice: {
          label: "",
          type: SPICE_TYPES[0],
        },
      },
      cssClass: 'custom-modal',
    });
    modal.present();
    const {data} = await modal.onDidDismiss();
    if (data && data.updated) {
      this.getSpices();
    }
  }

  public setSelectedToNewSpices(spices: Spice[]): void {
    spices.forEach((spice: Spice) => {
      const oldSpice: Spice | undefined = this.spices.find((s: Spice) => s._id === spice._id);
      if (oldSpice) {
        spice.selected = oldSpice.selected;
      }
    });
  }

  public deleteFilter(): void {
    this.filterService.deleteFilter();
    this.getSpices();
  }

  public getSpices(): void {
    this.loading = true;
    this.service.getSpices().subscribe((spices: Spice[]) => {
      if (!this.spices.length) {
        this.spices = spices;
      } else {
        this.spices = spices;
        this.setSelectedToNewSpices(spices);
      }

      this.setActiveSpices(spices);
      this.loading = false;
    });
  }

  public setActiveSpices(spices?: Spice[]): void {
    if (spices) {
      this.activeSpices = spices;
    }
    this.sortSpices();
  }

  public async showFilterOptions(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: FilterComponent,
    });
    await modal.present();
    const {data} = await modal.onDidDismiss();
    if (data && !data.isCancel) {
      this.getSpices();
      this.initPages();
    }
  }

  public async showPrintPage(): Promise<void> {
    if (!this.getNumberOfSelectedSpices(this.spices)) {
      this.showToast("Vous devez sélectionner au moins une épice.");
      return;
    }

    const modal = await this.modalCtrl.create({
      component: PrintComponent,
      componentProps: {
        spices: this.getSelectedSpices(this.spices),
      },
    });
    await modal.present();
    await modal.onDidDismiss();
    this.getSpices();
  }

  public goToAddView(): void {
    this.router.navigateByUrl("/tabs/new");
  }

  public getAllSelected(spices: Spice[]): boolean {
    return this.activeSpices.length > 0 && this.getNumberOfSelectedSpices(this.activeSpices) === this.activeSpices.length;
  }

  public getNumberOfSelectedSpices(spices: Spice[]): number {
    return this.getSelectedSpices(spices).length;
  }

  public getSelectedSpices(spices: Spice[]): Spice[] {
    return spices.filter((spice: Spice) => spice.selected);
  }

  public setAll(selected: boolean): void {
    this.activeSpices.forEach((spice: Spice) => this.setSpiceSelected(spice, selected));
  }

  public setSpiceSelected(selectedSpice: Spice, value: boolean): void {
    const spiceFromActiveSpices: Spice = this.activeSpices.find((spice: Spice) => spice._id === selectedSpice._id);
    spiceFromActiveSpices.selected = value;

    const spiceFromSpices: Spice = this.spices.find((spice: Spice) => spice._id === selectedSpice._id);
    spiceFromSpices.selected = value;
  }
}
