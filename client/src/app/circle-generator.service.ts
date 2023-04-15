import { Injectable } from "@angular/core";
import * as p5 from "p5";
import { Spice } from "./spice";
import { SERVER } from "./server";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ModalController } from "@ionic/angular";
import { Preview } from "./preview";
import { TemplateParams } from "./template-params";

@Injectable({
  providedIn: "root",
})
export class CircleGeneratorService {
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
    this.params = params;
    this.previewData = [];
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
      try {
        this.previewData[page].spices = spices;
      } catch {
        // fails silently
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

  private async drawEllipse(
    pos: { x: number; y: number },
    color: string
  ): Promise<void> {
    this.p5.fill(color);
    this.p5.ellipseMode(this.p5.CENTER);
    this.p5.noStroke();
    this.p5.ellipse(
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
        pos.x + this.params.imageOffsetX.value,
        pos.y + this.params.imageOffsetY.value,
        this.params.imageSize.value,
        this.params.imageSize.value
      );
    } catch (error) {
      throw error;
    }
  }

  private async drawSpicyLevel(
    pos: { x: number; y: number },
    level: number | undefined
  ): Promise<void> {
    return new Promise((resolve) => {
      if (level !== undefined) {
        this.p5.fill(255);
        this.p5.loadImage(
          `../assets/icon/pepper-hot-solid.svg`,
          (image: p5.Image) => {
            this.p5.image(
              image,
              pos.x + 5,
              pos.y - (this.params.itemHeight.value / 2 - 15),
              this.params.fontSize.value * 0.8,
              this.params.fontSize.value * 0.8
            );
            this.p5.textSize(this.params.fontSize.value * 0.8);
            this.p5.text(
              level.toString(),
              pos.x - 8,
              pos.y - (this.params.itemHeight.value / 2 - 15)
            );
            resolve();
          }
        );
      } else {
        resolve();
      }
    });
  }

  private async drawLabel(
    pos: { x: number; y: number },
    label: string,
    imageAdded: boolean
  ): Promise<void> {
    this.p5.fill(255);
    this.p5.rectMode(this.p5.CENTER);
    const fontSizeRatio: number =
      label.length > 30 ? 0.7 : label.length > 20 ? 0.85 : 1;
    this.p5.textSize(fontSizeRatio * this.params.fontSize.value);
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.text(
      label,
      pos.x + this.params.labelOffsetX.value,
      pos.y + this.params.labelOffsetY.value,
      this.params.labelWidth.value,
      100
    );
  }

  private async drawSpice(spice: Spice, index: number): Promise<void> {
    const pos: { x: number; y: number } = this.getPosition(index);
    await this.drawEllipse(pos, spice.type.color);
    let imageAdded: boolean = true;
    try {
      await this.drawImage(pos, spice._id);
    } catch (error) {
      imageAdded = false;
      throw error;
    }
    await this.drawLabel(pos, spice.label, imageAdded);
    if (spice.type.value === 6 && spice.spicyLevel) {
      await this.drawSpicyLevel(pos, spice.spicyLevel);
    }
  }
}
