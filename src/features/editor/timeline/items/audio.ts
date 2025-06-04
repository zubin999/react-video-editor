import {
  Audio as AudioBase,
  AudioProps,
  Control,
  timeMsToUnits,
} from "@designcombo/timeline";
import {
  AudioData,
  getAudioData,
  getWaveformPortion,
} from "@remotion/media-utils";
import { IDisplay } from "@designcombo/types";
import { SECONDARY_FONT } from "../../constants/constants";
import { createAudioControls } from "../controls";
const MAX_CANVAS_WIDTH = 12000; // Keep canvas size reasonable
const CANVAS_SAFE_DRAWING = 2000;

class Audio extends AudioBase {
  static type = "Audio";
  public barData?: AudioData;
  public tScale?: number;
  private offscreenCanvas: OffscreenCanvas | null = null;
  private offscreenCtx: OffscreenCanvasRenderingContext2D | null = null;

  public scrollLeft = 0;
  public display?: IDisplay;
  private isDirty: boolean = true;
  declare playbackRate: number;
  public bars: any[] = [];

  static createControls(): { controls: Record<string, Control> } {
    return { controls: createAudioControls() };
  }

  constructor(props: AudioProps) {
    super(props);
    this.fill = "#00586c";
    this.objectCaching = false;
    this.initOffscreenCanvas();
    this.initialize();
  }

  // Update the _render method to handle the visible portion
  public _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    this.drawTextIdentity(ctx);
    this.updateSelected(ctx);

    ctx.save();
    ctx.translate(-this.width / 2, -this.height / 2);

    // Clip the area to prevent drawing outside
    ctx.beginPath();
    ctx.rect(0, 0, this.width, this.height);
    ctx.clip();

    this.renderToOffscreen();

    // Draw only the visible portion
    const displayFromInUnits = timeMsToUnits(this.display!.from, this.tScale);
    const scrollLeft = this.scrollLeft + displayFromInUnits;
    const visibleStart = Math.max(0, -scrollLeft) - CANVAS_SAFE_DRAWING;
    ctx.drawImage(
      this.offscreenCanvas!,
      0,
      0,
      this.offscreenCanvas!.width,
      this.height,
      visibleStart,
      0,
      this.offscreenCanvas!.width,
      this.height,
    );

    ctx.restore();
    this.canvas?.requestRenderAll();
  }

  private async initialize() {
    const audioData = await getAudioData(this.src);
    this.barData = audioData;
    this.bars = this.getBars(0, 0) as any;
    this.canvas?.requestRenderAll();
    this.onScrollChange({ scrollLeft: 0 });
  }

  public setSrc(src: string) {
    this.src = src;
    this.initOffscreenCanvas();
    this.initialize();
    this.setCoords();
    this.canvas?.requestRenderAll();
  }

  private getBars(start: number, duration: number) {
    if (!this.barData) return;

    const durationInUnits = timeMsToUnits(
      this.duration!,
      this.tScale,
      this.playbackRate,
    );

    const bars = getWaveformPortion({
      audioData: this.barData,
      startTimeInSeconds: start / 1000 || 0,
      durationInSeconds: duration || this.barData.durationInSeconds,
      numberOfSamples: Math.round(durationInUnits / 4),
    });

    // Cache the result
    return bars;
  }

  private initOffscreenCanvas() {
    if (!this.offscreenCanvas) {
      this.offscreenCanvas = new OffscreenCanvas(this.width, this.height);
      this.offscreenCtx = this.offscreenCanvas.getContext("2d");
    }

    // Resize if dimensions changed
    if (
      this.offscreenCanvas.width !== this.width ||
      this.offscreenCanvas.height !== this.height
    ) {
      this.offscreenCanvas.width = this.width;
      this.offscreenCanvas.height = this.height;
      this.isDirty = true;
    }
  }

  public drawTextIdentity(ctx: CanvasRenderingContext2D) {
    const audioIconPath = new Path2D(
      "M8.24092 0C8.24092 2.51565 10.2795 4.55419 12.7951 4.55419C12.9677 4.55419 13.1331 4.62274 13.2552 4.74475C13.3772 4.86676 13.4457 5.03224 13.4457 5.20479C13.4457 5.37734 13.3772 5.54282 13.2552 5.66483C13.1331 5.78685 12.9677 5.85539 12.7951 5.85539C11.9218 5.85605 11.0594 5.66105 10.2713 5.28471C9.48319 4.90838 8.78942 4.36027 8.24092 3.68066V13.8794C8.24094 14.8271 7.91431 15.7458 7.31606 16.4808C6.71781 17.2157 5.88451 17.722 4.95657 17.9143C4.02863 18.1066 3.06276 17.9731 2.22172 17.5364C1.38067 17.0997 0.715856 16.3865 0.339286 15.5169C-0.0372842 14.6473 -0.10259 13.6744 0.154372 12.7622C0.411334 11.8501 0.974857 11.0544 1.74999 10.5092C2.52512 9.96403 3.46449 9.7027 4.40981 9.76924C5.35512 9.83579 6.24861 10.2261 6.93972 10.8745V0H8.24092ZM6.93972 13.8794C6.93972 13.1317 6.6427 12.4146 6.11398 11.8859C5.58527 11.3572 4.86818 11.0602 4.12046 11.0602C3.37275 11.0602 2.65566 11.3572 2.12694 11.8859C1.59823 12.4146 1.3012 13.1317 1.3012 13.8794C1.3012 14.6272 1.59823 15.3443 2.12694 15.873C2.65566 16.4017 3.37275 16.6987 4.12046 16.6987C4.86818 16.6987 5.58527 16.4017 6.11398 15.873C6.6427 15.3443 6.93972 14.6272 6.93972 13.8794Z",
    );
    ctx.save();
    ctx.translate(-this.width / 2, -this.height / 2);

    ctx.translate(0, 6);
    ctx.font = `400 12px ${SECONDARY_FONT}`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.clip();
    ctx.fillText("Audio", 36, 16);
    ctx.translate(8, 1);
    ctx.fillStyle = "#ffffff";
    ctx.fill(audioIconPath);
    ctx.restore();
  }

  public updateSelected(ctx: CanvasRenderingContext2D) {
    const borderColor = this.isSelected
      ? "rgba(255, 255, 255,1.0)"
      : "rgba(255, 255, 255,0.1)";
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
      6,
    );
    ctx.lineWidth = 1;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    ctx.restore();
  }

  public calculateOffscreenWidth({ scrollLeft }: { scrollLeft: number }) {
    const offscreenWidth = Math.min(this.left + scrollLeft, 0);

    return Math.abs(offscreenWidth);
  }

  public onScrollChange({ scrollLeft }: { scrollLeft: number }) {
    this.scrollLeft = scrollLeft;
    this.isDirty = true; // Mark as dirty after preparing new thumbnails
  }

  public renderToOffscreen(force?: boolean) {
    if (!this.offscreenCtx) return;
    if (!this.isDirty && !force) return;

    this.offscreenCanvas!.width = MAX_CANVAS_WIDTH;
    this.offscreenCanvas!.height = this.height;

    const ctx = this.offscreenCtx;
    // Calculate visible range
    const displayFromInUnits = timeMsToUnits(this.display!.from, this.tScale);
    const scrollLeft = this.scrollLeft + displayFromInUnits;
    // Calculate the offset caused by the trimming
    const trimFromSize = timeMsToUnits(
      this.trim.from,
      this.tScale,
      this.playbackRate,
    );
    const visibleStart =
      Math.max(0, -scrollLeft) - CANVAS_SAFE_DRAWING + trimFromSize;
    const visibleWidth = MAX_CANVAS_WIDTH;

    const bars = this.bars;
    if (!bars) return;

    // Clear the offscreen canvas
    ctx.clearRect(0, 0, this.offscreenCanvas!.width, this.height);

    // Clip with rounded corners
    ctx.beginPath();
    ctx.roundRect(0, 0, this.offscreenCanvas!.width, this.height, this.rx);
    ctx.clip();

    // Draw waveform
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.imageSmoothingEnabled = false;

    // Calculate which bars are visible
    const barWidth = 4; // 1px bar + 3px space
    const startBarIndex = Math.floor(visibleStart / barWidth);
    const endBarIndex = Math.ceil((visibleStart + visibleWidth) / barWidth);
    // Only draw visible bars
    ctx.beginPath();
    for (let i = startBarIndex; i < endBarIndex && i < bars.length; i++) {
      const bar = bars[i];
      if (bar) {
        const x = Math.round(i * barWidth - visibleStart);
        if (x >= 0 && x < this.offscreenCanvas!.width) {
          const amplitude = bar.amplitude || 0;
          const height = Math.round(amplitude * 15);
          const y = Math.round((20 - height) / 2 + 8);
          ctx.rect(x, y, 1, height);
        }
      }
    }
    ctx.fill();
    this.isDirty = false;
  }

  public onResizeSnap() {
    this.renderToOffscreen(true);
  }

  public onResize() {
    this.renderToOffscreen(true);
  }

  public onScale() {
    this.bars = this.getBars(0, 0) as any;
    this.onScrollChange({ scrollLeft: this.scrollLeft });
  }
}

export default Audio;
