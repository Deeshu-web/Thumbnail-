export type AspectRatio = '16:9' | '9:16';

export interface VariationOptions {
  colorVariation: boolean;
  fontChange: boolean;
  layoutVariation: boolean;
  backgroundChange: boolean;
  elementReplacement: boolean;
  textReplacement: boolean;
  faceChange: boolean;
  personChange: boolean;
  aspectRatio: AspectRatio;
}

export interface GenerateThumbnailParams {
  image: File;
  text: string;
  intensity: number;
  options: VariationOptions;
  faceImage?: File | null;
  personImage?: File | null;
}

export interface EditThumbnailParams {
    imageBase64: string;
    prompt: string;
}
