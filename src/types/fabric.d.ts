import { FabricObject } from 'fabric';

declare module 'fabric' {
  interface FabricObject {
    layerId?: string;
    layerType?: 'image' | 'mask' | 'shape';
  }
}