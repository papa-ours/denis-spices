import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  public isDark: boolean;
  constructor() {
    this.isDark = true;
  }

  public toggleDark(): void {
    document.body.classList.toggle('dark');
  }
}
