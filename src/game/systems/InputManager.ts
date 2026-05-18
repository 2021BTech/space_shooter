export class InputManager {
  private keys: Set<string> = new Set();
  private _touchX = 0;
  private _touchY = 0;
  private _touchActive = false;
  private _touchFire = false;

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.keys.add(e.key);
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keys.delete(e.key);
  }

  isDown(key: string): boolean {
    return this.keys.has(key);
  }

  get left(): boolean {
    return this.isDown('ArrowLeft') || this.isDown('a') || this.isDown('A');
  }

  get right(): boolean {
    return this.isDown('ArrowRight') || this.isDown('d') || this.isDown('D');
  }

  get up(): boolean {
    return this.isDown('ArrowUp') || this.isDown('w') || this.isDown('W');
  }

  get down(): boolean {
    return this.isDown('ArrowDown') || this.isDown('s') || this.isDown('S');
  }

  get fire(): boolean {
    return this.isDown(' ') || this._touchFire;
  }

  get touchActive(): boolean {
    return this._touchActive;
  }

  get touchX(): number {
    return this._touchX;
  }

  get touchY(): number {
    return this._touchY;
  }

  setTouch(x: number, y: number): void {
    this._touchX = x;
    this._touchY = y;
    this._touchActive = true;
  }

  clearTouch(): void {
    this._touchActive = false;
  }

  setTouchFire(firing: boolean): void {
    this._touchFire = firing;
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
