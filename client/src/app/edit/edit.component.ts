import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SpiceService } from '../spice.service';
import { Spice } from '../spice';
import { SPICE_TYPES } from '../spice-types';
import { SpiceType } from '../spice-type';
import { ToastController, ModalController, AlertController } from '@ionic/angular';
import { TemplateService } from '../template.service';
import { TemplateParams } from '../template-params';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  @Input() public _id: string;
  @Input() public spice: Spice;
  @Input() public isAdd: boolean;
  public readonly spiceTypes: SpiceType[] = SPICE_TYPES;
  public imageSources: string[];
  public loading: boolean;
  public noResults: boolean;
  public selectedImage: string;
  public templateNames: string[];

  constructor(
    private toastController: ToastController,
    private service: SpiceService,
    private templateService: TemplateService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
  ) {
    this.imageSources = [];
    this.loading = false;
    this.noResults = false;
    this.selectedImage = "";
  }

  public initSpice(): void {
    this.spice = {
      label: "",
      type: SPICE_TYPES[0],
      expirationDate: "",
      spicyLevel: 0,
      owner: "Denis",
      epicesDeCru: true,
      toPrint: [],
      printed: [],
    }
  }

  public ngOnInit(): void {
    this.templateService.getTemplates().subscribe((templates: TemplateParams[]) => {
      this.templateNames = templates.map((template: TemplateParams) => template.name.value);
    });

    if (this.spice.label) {
      this.loadImages();
      this.getCurrentImage();
    } else {
      this.initSpice();
    }
  }

  private getCurrentImage(): void {
    this.service.getImageForSpice(this._id).subscribe((imageSource: string) => this.selectedImage = imageSource);
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

  public async onSubmit(): Promise<void> {
    this.spice.label = this.spice.label.trim();
    if (this.spice.label === "") {
      this.showToast('Le nom ne doit pas être vide');
      return;
    }

    if (this.selectedImage === "") {
      const confirmation: boolean = await this.showNoImageConfirmation();
      if (!confirmation) {
        return;
      }
    }

    this.isAdd ? this.addSpice() : this.updateSpice();
  }

  private async showNoImageConfirmation(): Promise<boolean> {
    const alert = await this.alertController.create({
      message: 'Voulez-vous vraiment continuer sans ajouter une image?',
      buttons: [
        {
          text: 'NON',
          handler: () => alert.dismiss(),
          role: 'cancel',
        },
        {
          text: 'OUI',
          handler: () => alert.dismiss(),
          role: 'confirm',
        }
      ]
    });
    alert.present();

    return (await alert.onDidDismiss()).role === 'confirm';
  }

  private updateSpice(): void {
    this.service.updateSpice(this._id, this.spice, this.selectedImage).subscribe(async () => {
      this.initSpice();
      this.imageSources = [];
      this.dismiss(true);
    });
  }

  private addSpice(): void {
    this.service.createSpice(this.spice, this.selectedImage).subscribe(() => {
      this.initSpice();
      this.imageSources = [];
      this.dismiss(true);
    });
  }

  public updateLabel($event: CustomEvent) {
    this.spice.label = $event.detail.value;
  }

  public async showImageAlert(source: string): Promise<void> {
    const alert = await this.alertController.create({
      message: '<img src="' + source + '"/>',
      buttons: [
        'OK',
      ],
    });
    alert.present();
  }

  public dismiss(updated: boolean = false): void {
    this.modalCtrl.dismiss({updated});
  }

  public async chooseFile(): Promise<void> {
    const fileInput: HTMLInputElement = document.createElement("input");
    fileInput.setAttribute("type", "file");
    fileInput.click();
    
    fileInput.addEventListener("input", async () => {
      const file: File = fileInput.files[0];
      if (!this.validateImage(file)) {
        return;
      }

      const dataUrl: string = await this.readFile(file);
      this.imageSources = [dataUrl];
      this.selectedImage = dataUrl;
    });
  }

  public async readFile(file: File): Promise<string> {
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise((resolve) => {
      reader.addEventListener("load", () => {
        resolve(reader.result as string);
      });
    });
  }

  public validateImage(file: any): boolean {
    if (!file.type.includes("image")) {
      this.showToast("Le fichier doit être une image");
      return false;
    }

    return true;
  }

  public updateType($event: CustomEvent) {
    this.spice.type = this.spiceTypes[$event.detail.value];
  }

  public loadImages(): void {
    this.loading = true;
    this.service.loadImages(this.spice.label).subscribe((paths: string[]) => {
      this.imageSources = paths.filter((path: string) => path !== '');
      this.noResults = this.imageSources.length === 0;
      this.loading = false;
    });
  }

  public parseSourceToImageLabel(source: string): string {
    if (source.includes("data:image")) {
      return "";
    }
    source = source.replace(".jpg", "");
    return source.substr(source.lastIndexOf("/") + 1).split("-").join(" ");
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

