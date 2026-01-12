import { createWorker } from "tesseract.js";

export interface OcrResult {
  text: string;
  extractedData: {
    volume?: number;
    date?: string;
    invoiceNumber?: string;
    amount?: number;
  };
}

export async function extractTextFromImage(
  imageSource: string | File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  const worker = await createWorker("fra+deu+eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  try {
    const { data } = await worker.recognize(imageSource);
    const extractedData = parseTicketData(data.text);
    
    return {
      text: data.text,
      extractedData,
    };
  } finally {
    await worker.terminate();
  }
}

function parseTicketData(text: string): OcrResult["extractedData"] {
  const result: OcrResult["extractedData"] = {};
  
  const volumePatterns = [
    /(\d+[.,]\d+)\s*(?:l|L|litres?|liters?|Liter)/i,
    /(?:volume|quantité|menge|qty)[:\s]*(\d+[.,]\d+)/i,
    /(\d+[.,]\d{2,3})\s*(?:l|L)/,
  ];
  
  for (const pattern of volumePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.volume = parseFloat(match[1].replace(",", "."));
      break;
    }
  }
  
  const datePatterns = [
    /(\d{2})[./-](\d{2})[./-](\d{4})/,
    /(\d{4})[./-](\d{2})[./-](\d{2})/,
    /(\d{2})[./-](\d{2})[./-](\d{2})/,
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[1].length === 4) {
        result.date = `${match[1]}-${match[2]}-${match[3]}`;
      } else if (match[3].length === 4) {
        result.date = `${match[3]}-${match[2]}-${match[1]}`;
      } else {
        const year = parseInt(match[3]) > 50 ? `19${match[3]}` : `20${match[3]}`;
        result.date = `${year}-${match[2]}-${match[1]}`;
      }
      break;
    }
  }
  
  const invoicePatterns = [
    /(?:facture|rechnung|invoice|quittung|reçu|beleg)[:\s#]*(\w+[-/]?\d+)/i,
    /(?:n°|nr\.?|no\.?)[:\s]*(\d{4,})/i,
    /(?:ticket|bon)[:\s#]*(\d+)/i,
  ];
  
  for (const pattern of invoicePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.invoiceNumber = match[1];
      break;
    }
  }
  
  const amountPatterns = [
    /(?:total|montant|betrag|summe)[:\s]*(?:CHF|Fr\.?)?\s*(\d+[.,]\d{2})/i,
    /(?:CHF|Fr\.?)\s*(\d+[.,]\d{2})/i,
  ];
  
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.amount = parseFloat(match[1].replace(",", "."));
      break;
    }
  }
  
  return result;
}
