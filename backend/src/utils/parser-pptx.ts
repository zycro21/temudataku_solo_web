import { parseOfficeAsync } from "officeparser";

export const parsePptxToText = async (filePath: string): Promise<string> => {
  try {
    // Parse the .pptx file and extract text
    const text = await parseOfficeAsync(filePath);
    return text;
  } catch (error: any) {
    console.error("Error parsing PPTX file:", error.message);
    throw new Error(`Failed to parse PPTX file: ${error.message}`);
  }
};
