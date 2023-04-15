import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { SPICE_TYPES } from '../spice-types';
import { SpiceType } from '../spice-type';
import { FilterService } from '../filter.service';
import { TemplateService } from '../template.service';
import { TemplateParams } from '../template-params';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {
  public labelFilter: string;
  public selectedTypes: number[];
  public selectedToPrint: string[];
  public templateNames: string[];
  public epicesDeCru: boolean;
  public others: boolean;
  public owner: string;
  public readonly spiceTypes: SpiceType[] = SPICE_TYPES;
  public selectedPrinted: string[];

  constructor(
    private modalCtrl: ModalController,
    private service: FilterService,
    private toastController: ToastController,
    private templateService: TemplateService,
  ) {
    this.labelFilter = JSON.parse(JSON.stringify(this.service.label));
    this.selectedTypes = JSON.parse(JSON.stringify(this.service.types));
    this.selectedPrinted = JSON.parse(JSON.stringify(this.service.selectedPrinted));
    this.selectedToPrint = JSON.parse(JSON.stringify(this.service.selectedToPrint));
    this.epicesDeCru = JSON.parse(JSON.stringify(this.service.epicesDeCru));
    this.owner = JSON.parse(JSON.stringify(this.service.owner));
    this.others = JSON.parse(JSON.stringify(this.service.others));
  }

  public ngOnInit(): void {
    this.templateService.getTemplates().subscribe((templates: TemplateParams[]) => {
      this.templateNames = templates.map((template: TemplateParams) => template.name.value);
    });
  }

  public selectAll(): void {
    this.selectedTypes = SPICE_TYPES.map((type: SpiceType) => type.value);
  }

  public deselectAll(): void {
    this.selectedTypes = [];
  }

  public get allSelected(): boolean {
    return this.selectedTypes.length === SPICE_TYPES.length;
  }

  public isSelected(value: number): boolean {
    return this.selectedTypes.indexOf(value) !== -1;
  }

  public toggleType(value: number): void {
    if (this.isSelected(value)) {
      this.selectedTypes.splice(this.selectedTypes.indexOf(value), 1);
    } else {
      this.selectedTypes.push(value);
    }
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
 
  public onSubmit() {
    if (!this.selectedTypes.length) {
      this.showToast("Vous devez choisir au moins un type");
      return;
    }

    if (!(this.others || this.epicesDeCru)) {
      this.showToast("Vous devez choisir au moins une provenance");
      return;
    }

    this.service.label = this.labelFilter;
    this.service.types = this.selectedTypes;
    this.service.selectedPrinted = this.selectedPrinted;
    this.service.selectedToPrint = this.selectedToPrint;
    this.service.owner = this.owner;
    this.service.epicesDeCru = this.epicesDeCru;
    this.service.others = this.others;
     
    this.dismiss(false);
  }

  public dismiss(isCancel: boolean = true): void {
    this.modalCtrl.dismiss({
      isCancel: isCancel, 
    });
  }

  public toggleToPrint(templateName: string, list: string[]): void {
    const index: number = list.indexOf(templateName);
    if (index === -1) {
      list.push(templateName);
    } else {
      list.splice(index, 1);
    }
  }
}
