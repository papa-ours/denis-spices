import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { SpiceItemComponent } from '../spice-item/spice-item.component';
import { EditComponent } from '../edit/edit.component';
import { FilterComponent } from '../filter/filter.component';
import { PrintComponent } from '../print/print.component';

@NgModule({
  entryComponents: [EditComponent, FilterComponent, PrintComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab1Page }]),
  ],
  declarations: [Tab1Page, SpiceItemComponent, EditComponent, FilterComponent, PrintComponent]
})
export class Tab1PageModule {}
