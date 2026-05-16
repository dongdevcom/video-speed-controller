export enum MountPosition {
  FirstChild = 'firstChild',
  LastChild = 'lastChild'
}

export interface MountConfig {
  element: HTMLElement;
  position: MountPosition;
}
