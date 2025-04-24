declare module "pptx-parser" {
  export interface Slide {
    text: string;
  }

  export function parse(filePath: string): Promise<Slide[]>;
}
