import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SpiceType } from '../spice-type';
import { Spice } from '../spice';
import { SpiceService } from '../spice.service';
import { ModalController, AlertController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { EditComponent } from '../edit/edit.component';
import { SERVER } from '../server';

@Component({
  selector: 'app-spice-item',
  templateUrl: './spice-item.component.html',
  styleUrls: ['./spice-item.component.scss'],
})
export class SpiceItemComponent implements OnInit {

  @Input() public spice: Spice;
  @Input() public selected: boolean;
  @Output() public editEvent: EventEmitter<void>;
  @Output() public selectEvent: EventEmitter<void>;
  public imageSource: string;

  public constructor(private service: SpiceService, private alertCtrl: AlertController, private modalCtrl: ModalController) {
    this.editEvent = new EventEmitter<void>();
    this.selectEvent = new EventEmitter<void>();
  }

  public ngOnInit(): void {
    this.imageSource = `${SERVER}spice/image/content/${this.spice._id}`;
  }

  public async showEditModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: EditComponent,
      componentProps: {
        isAdd: false,
        _id: this.spice._id,
        spice: this.spice,
      },
      cssClass: 'custom-modal',
    });
    modal.present();
    const {data} = await modal.onDidDismiss();
    if (data && data.updated) {
      this.editEvent.emit();
    }
  }

  public async showDeleteConfirm(): Promise<void> {
    const modal = await this.alertCtrl.create({
      header: 'Supprimer',
      subHeader: this.spice.label + '?',
      buttons: [
        {
          text: 'NON',
        }, {
          text: 'OUI',
          handler: () => {
            this.service.deleteSpice(this.spice._id).subscribe(() => this.editEvent.emit());
          }
        }
      ]
    })
    modal.present();
  }
}