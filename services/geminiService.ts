// Fix: Import the 'Part' type from @google/genai
import { GoogleGenAI, Modality, Part } from "@google/genai";
import type { GenerateThumbnailParams, EditThumbnailParams } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            // This case should ideally not happen with readAsDataURL
            resolve('');
        }
    };
    reader.readAsDataURL(file);
  });
  const base64Data = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };
};

const buildPrompt = (text: string, intensity: number, options: GenerateThumbnailParams['options']): string => {
    const { aspectRatio, ...restOptions } = options;
    const resolution = aspectRatio === '16:9' ? '1280x720' : '720x1280';

    let intensityDescription = '';
    if (intensity <= 3) {
        intensityDescription = "very similar to the original, with only minor tweaks.";
    } else if (intensity <= 7) {
        intensityDescription = "taking creative liberties, with noticeable changes to layout and background.";
    } else {
        intensityDescription = "completely reimagined, using the original only as loose inspiration.";
    }

    const requestedChanges = Object.entries(restOptions)
        .filter(([, value]) => value)
        .map(([key]) => {
            switch (key) {
                case 'colorVariation': return '- Use a new, vibrant, and contrasting color palette.';
                case 'fontChange': return '- Use a different, modern, and bold sans-serif font for the text.';
                case 'layoutVariation': return '- Rearrange the main elements for a fresh composition.';
                case 'backgroundChange': return '- Replace the background with something thematically similar but more dynamic.';
                case 'elementReplacement': return '- Replace or add new graphical elements (emojis, arrows, icons).';
                case 'textReplacement': return `- The primary title text should be '${text}'. Make it the main focus.`;
                case 'faceChange': return '- Swap the face of the main person with the face from the SECOND image, ensuring an exact facial match.';
                case 'personChange': return '- Replace the main person entirely with the person from the SECOND image, ensuring an exact facial match.';
                default: return '';
            }
        })
        .join('\n');
    
    const faceSwapInstruction = options.faceChange
        ? `\n\n**Critical Instruction: Face Swap with Exact Facial Match**
You are given two images. The FIRST is the base thumbnail, the SECOND is an image of a face. Your most important task is to swap the face of the main person in the FIRST image with the face from the SECOND image. **It is absolutely crucial that the new face is an EXACT replica of the face from the SECOND image.** Do not alter its features, expression, or identity. Ensure the skin tone, lighting, and style match the thumbnail for a seamless blend.`
        : '';
    
    const personSwapInstruction = options.personChange
        ? `\n\n**Critical Instruction: Person Swap with Exact Facial Match**
You are given two images. The FIRST is the base thumbnail, the SECOND contains a person. Your most important task is to completely replace the main person in the FIRST image with the person from the SECOND image. **It is absolutely crucial that the face of the new person in the thumbnail is an EXACT replica of the face from the SECOND image.** Do not alter their facial features, expression, or identity. The pose and clothing can be adapted to fit the new thumbnail's style, but the face MUST remain identical. The original person must not be visible.`
        : '';

    return `
You are an expert YouTube thumbnail designer AI. Your task is to recreate the provided thumbnail image with creative variations. Do not copy it directly. Create a new, unique, and compelling thumbnail to maximize click-through rate.
${faceSwapInstruction}${personSwapInstruction}

**User's New Title Text:** "${text || 'Not provided'}"
${options.textReplacement && text ? `This new text is the most important element.` : `If no new text is provided, analyze and enhance the existing text.`}

**Variation Intensity (1-10):** ${intensity} (${intensityDescription})

**Specific Changes Requested:**
${requestedChanges || "- No specific changes requested, use your creative judgement based on the intensity level."}

**Output Requirements:**
- **CRITICAL:** The final image MUST be in a ${aspectRatio} aspect ratio (e.g., ${resolution}). This is the most important rule.
- The style must be modern, high-quality, and professional.
- The title text must be extremely legible and prominent.
- The output MUST be only the image. Do not add any text description in your response.
    `;
};

export const generateThumbnail = async ({ image, text, intensity, options, faceImage, personImage }: GenerateThumbnailParams): Promise<string> => {
    const prompt = buildPrompt(text, intensity, options);
    
    const imagePart = await fileToGenerativePart(image);
    // Fix: Explicitly type `parts` as an array of `Part` to allow both image and text parts.
    const parts: Part[] = [imagePart];

    // The order is important here. The prompt refers to the main thumbnail as the "FIRST" image
    // and the face/person image as the "SECOND" image.
    if (faceImage && options.faceChange) {
        const faceImagePart = await fileToGenerativePart(faceImage);
        parts.push(faceImagePart);
    } else if (personImage && options.personChange) {
        const personImagePart = await fileToGenerativePart(personImage);
        parts.push(personImagePart);
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: parts,
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    throw new Error('No image was generated by the API.');
};

export const editThumbnail = async ({ imageBase64, prompt }: EditThumbnailParams): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: 'image/png',
        },
    };

    const editPrompt = `
You are an expert image editor AI. Your task is to edit the provided image based on the user's instructions.
Apply the following changes precisely:
"${prompt}"

**Output Requirements:**
- **CRITICAL:** The final image MUST maintain the original aspect ratio of the provided image. This is the most important rule.
- The style must be consistent with the original image unless instructed otherwise.
- The output MUST be only the image. Do not add any text description in your response.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [imagePart, { text: editPrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    throw new Error('No image was returned after editing.');
};
