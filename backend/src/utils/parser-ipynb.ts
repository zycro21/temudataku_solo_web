import fs from "fs/promises";
import { extname } from "path";

// Define TypeScript interface for Jupyter Notebook structure
interface NotebookCell {
  cell_type: "markdown" | "code" | "raw";
  source: string[];
}

interface Notebook {
  cells: NotebookCell[];
}

export const parseNotebookToText = async (
  filePath: string
): Promise<string> => {
  // Validate file extension
  if (extname(filePath).toLowerCase() !== ".ipynb") {
    throw new Error("Invalid file type: Only .ipynb files are supported");
  }

  try {
    // Read file content
    const content = await fs.readFile(filePath, "utf-8");

    // Parse JSON
    const json: Notebook = JSON.parse(content);

    // Validate cells array
    if (!Array.isArray(json.cells)) {
      throw new Error(
        "Invalid notebook format: Missing or invalid cells array"
      );
    }

    // Extract text from cells
    const text = json.cells
      .map((cell: NotebookCell) => {
        if (
          (cell.cell_type === "markdown" || cell.cell_type === "code") &&
          Array.isArray(cell.source)
        ) {
          return cell.source.join("").trim();
        }
        return "";
      })
      .filter((text) => text) // Remove empty strings
      .join("\n\n"); // Use double newline for better separation

    return text;
  } catch (error: any) {
    console.error("Error parsing notebook:", error.message);
    throw new Error(`Failed to parse notebook: ${error.message}`);
  }
};
