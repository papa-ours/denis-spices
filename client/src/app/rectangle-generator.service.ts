import { Injectable } from "@angular/core";
import * as p5 from "p5";
import { Spice } from "./spice";
import { SERVER } from "./server";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Preview } from "./preview";
import { TemplateParams } from "./template-params";

@Injectable({
  providedIn: "root",
})
export class RectangleGeneratorService {
  private params: TemplateParams;
  public width: number;
  public height: number;
  public indexOffset: number;
  public ready: boolean;
  public mask: p5.Image;
  public mock: p5.Image;
  public loading: boolean;
  private p5: p5;
  public previewData: Preview[];
  public currentPage: number;
  public qualityWarning: boolean;
  public shape: number;
  public spices: Spice[];

  constructor(private sanitizer: DomSanitizer) {
    this.spices = [];
    this.ready = false;
    this.indexOffset = 0;
    this.width = 612;
    this.height = 792;
    this.loading = false;
    this.currentPage = 0;
    this.previewData = [];
    this.qualityWarning = false;
  }

  public get max(): number {
    return this.params.colCount.value * this.params.rowCount.value;
  }

  public get numberOfPages(): number {
    return Math.ceil((this.spices.length + this.indexOffset) / this.max);
  }

  public async generate(
    spices: Spice[],
    clientP5: p5,
    offset: number,
    params: TemplateParams
  ): Promise<Preview[]> {
    this.previewData = [];
    this.params = params;
    this.indexOffset = offset;
    this.p5 = clientP5;
    this.spices = spices;
    await this.getMask();
    await this.getMock();
    let page: number = 0;
    this.loading = true;

    while (page < this.numberOfPages) {
      const index: number =
        page === 0 ? -1 : this.max - this.indexOffset + (page - 1) * this.max;
      const spices: Spice[] =
        page === 0
          ? this.spices.slice(0, this.max - this.indexOffset)
          : this.spices.slice(index, index + this.max);
      const startIndex: number = page === 0 ? this.indexOffset : 0;
      this.previewData[page] = await this.generatePage(spices, startIndex);
      if (this.previewData[page]) {
        this.previewData[page].spices = spices;
      }
      page++;
    }

    this.loading = false;
    this.ready = true;

    return this.previewData;
  }

  public save(page: number): void {
    this.p5.loadImage(this.previewData[page].data, (image: p5.Image) => {
      this.p5.save(image, "epice-" + page + ".png");
    });
  }

  public async generatePage(
    spices: Spice[],
    startIndex: number
  ): Promise<Preview> {
    if (!spices.length) {
      return;
    }

    this.p5.clear();
    await this.drawSpices(spices, startIndex);
    return this.getPreview();
  }

  public async getPreview(): Promise<Preview> {
    return new Promise((resolve) => {
      this.p5.saveFrames("f", "png", 1, 1, (data: any[]) => {
        resolve({
          safeUrl: this.sanitizer.bypassSecurityTrustUrl(data[0].imageData),
          data: data[0].imageData,
        });
      });
    });
  }

  private async getMask(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.p5.loadImage(
        `${SERVER}mask`,
        (image: p5.Image) => {
          this.mask = image;
          resolve();
        },
        () => reject()
      );
    });
  }

  private async getMock(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.p5.loadImage(
        `../assets/mock.png`,
        (image: p5.Image) => {
          this.mock = image;
          this.mock.mask(this.mask);
          resolve();
        },
        (reason: any) => {
          reject(reason);
          throw Error();
        }
      );
    });
  }

  private async drawSpices(
    spices: Spice[],
    startIndex: number
  ): Promise<void[]> {
    return Promise.all(
      spices.map((spice: Spice, index: number) =>
        this.drawSpice(spice, startIndex + index)
      )
    );
  }

  private async getRoundImage(_id: string): Promise<p5.Image> {
    return new Promise((resolve, reject) => {
      if (_id === "-1") {
        resolve(this.mock);
      } else {
        this.p5.loadImage(
          `${SERVER}spice/image/content/${_id}`,
          (image: p5.Image) => {
            image.mask(this.mask);
            resolve(image);
          },
          () => reject()
        );
      }
    });
  }

  private getPosition(index: number): { x: number; y: number } {
    return {
      x:
        (index % this.params.colCount.value) *
          this.params.itemLeftDistance.value +
        this.params.leftPadding.value,
      y:
        Math.floor(index / this.params.colCount.value) *
          this.params.itemTopDistance.value +
        this.params.topPadding.value,
    };
  }

  private async drawRect(
    pos: { x: number; y: number },
    color: string
  ): Promise<void> {
    this.p5.fill(color);
    this.p5.rectMode(this.p5.CENTER);
    this.p5.noStroke();
    this.p5.rect(
      pos.x,
      pos.y,
      this.params.itemWidth.value,
      this.params.itemHeight.value
    );
  }

  private async drawImage(
    pos: { x: number; y: number },
    _id: string
  ): Promise<void> {
    this.p5.imageMode(this.p5.CENTER);
    try {
      const image: p5.Image = await this.getRoundImage(_id);
      this.p5.image(
        image,
        pos.x,
        pos.y,
        this.params.imageSize.value,
        this.params.imageSize.value
      );
    } catch {
      throw Error();
    }
  }

  private async drawLabel(
    pos: { x: number; y: number },
    label: string
  ): Promise<void> {
    this.p5.fill(255);
    this.p5.rectMode(this.p5.CENTER);
    const fontSizeRatio: number =
      label.length > 30 ? 0.7 : label.length > 20 ? 0.85 : 1;
    this.p5.textSize(fontSizeRatio * this.params.fontSize.value);
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    const maxWidth: number =
      this.params.itemWidth.value / this.params.numberOfItems.value;
    if (this.params.imageSize.value > 0) {
      this.p5.text(
        label,
        pos.x,
        pos.y + (this.params.imageSize.value / 2 + 15),
        maxWidth,
        maxWidth
      );
      this.p5.text(
        label,
        pos.x,
        pos.y - (this.params.imageSize.value / 2 + 15),
        maxWidth,
        maxWidth
      );
    } else {
      this.p5.text(label, pos.x, pos.y, maxWidth, maxWidth);
    }
  }

  private async drawExpirationDate(
    pos: { x: number; y: number },
    dateStr: string
  ): Promise<void> {
    this.p5.rectMode(this.p5.CENTER);
    this.p5.push();
    const whiteRectHeight: number = 25;
    this.p5.translate(
      pos.x + this.params.itemWidth.value / 2 - whiteRectHeight / 2,
      pos.y
    );
    this.p5.rotate(this.p5.radians(270));

    this.p5.fill(255);

    this.p5.rect(0, 0, this.params.itemHeight.value, whiteRectHeight);

    this.p5.fill(0);
    const date: Date = new Date(dateStr);
    const MONTH_NAMES: string[] = [
      "JAN",
      "FÉV",
      "MAR",
      "AVR",
      "MAI",
      "JUIN",
      "JUIL",
      "AOÛT",
      "SEP",
      "OCT",
      "NOV",
      "DÉC",
    ];
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.textSize(10);
    this.p5.text(MONTH_NAMES[date.getMonth()] + " " + date.getFullYear(), 0, 0);

    this.p5.pop();
  }

  private async drawSpicyLevel(
    pos: { x: number; y: number },
    level: number | undefined
  ): Promise<void> {
    return new Promise((resolve) => {
      if (level !== undefined) {
        this.p5.fill(255);
        this.p5.imageMode(this.p5.CENTER);
        this.p5.loadImage(
          `../assets/icon/pepper-hot-solid.svg`,
          (image: p5.Image) => {
            const imageWidth: number = this.params.fontSize.value * 0.8;
            this.p5.image(image, pos.x + 8, pos.y, imageWidth, imageWidth);
            this.p5.textSize(this.params.fontSize.value * 0.8);
            this.p5.text(level.toString(), pos.x - 8, pos.y);
            resolve();
          }
        );
      }
    });
  }

  private async drawSpice(spice: Spice, index: number): Promise<void> {
    const pos: { x: number; y: number } = this.getPosition(index);
    await this.drawRect(pos, spice.type.color);
    if (spice.expirationDate) {
      this.drawExpirationDate(pos, spice.expirationDate);
    }

    for (let i = 0; i < this.params.numberOfItems.value; i++) {
      let offset: number =
        i -
        Math.floor(this.params.numberOfItems.value / 2) +
        (this.params.numberOfItems.value % 2 ? 0 : 0.5);
      const itemPos: { x: number; y: number } = {
        x:
          pos.x +
          (offset * this.params.itemWidth.value) /
            this.params.numberOfItems.value,
        y: pos.y,
      };
      if (this.params.imageSize.value > 0) {
        await this.drawImage(itemPos, spice._id);
      }
      await this.drawLabel(itemPos, spice.label);
    }

    if (spice.type.value === 6 && spice.spicyLevel) {
      for (let i = 0; i < this.params.numberOfItems.value - 1; i++) {
        const itemPos: { x: number; y: number } = {
          x:
            pos.x +
            (Math.pow(-1, i) * this.params.itemWidth.value) /
              (this.params.numberOfItems.value * 2),
          y: pos.y,
        };
        await this.drawSpicyLevel(itemPos, spice.spicyLevel);
      }
    }
  }
}
