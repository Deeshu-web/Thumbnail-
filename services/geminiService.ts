
import { GoogleGenAI, Modality, Part } from "@google/genai";
import type { GenerateThumbnailParams, EditThumbnailParams } from '../types';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
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

const buildPrompt = (text: string, intensity: number, options: GenerateThumbnailParams['options'], isPro: boolean): string => {
    const { aspectRatio, ...restOptions } = options;
    const resolution = aspectRatio === '16:9' ? (isPro ? '1920x1080' : '1280x720') : (isPro ? '1080x1920' : '720x1280');

    let intensityDescription = '';
    if (intensity <= 3) {
        intensityDescription = "Iterative tweak: keep the soul of the original but sharpen the impact.";
    } else if (intensity <= 7) {
        intensityDescription = "Creative reimagining: move elements, swap textures, keep the theme.";
    } else {
        intensityDescription = "Total overhaul: use the concept as a loose baseline only.";
    }

    const requestedChanges = Object.entries(restOptions)
        .filter(([, value]) => value)
        .map(([key]) => {
            switch (key) {
                case 'colorVariation': return '- Transform the color grade. Use high-contrast, trendy LUTs.';
                case 'fontChange': return '- Modern typography swap. Use bold, 3D, or heavy-outline styles.';
                case 'layoutVariation': return '- Drastic composition change. Rule of thirds optimization.';
                case 'backgroundChange': return '- High-fidelity background swap. Maintain thematic logic.';
                case 'elementReplacement': return '- Asset update: replace old icons/emojis with high-res 3D counterparts.';
                case 'textReplacement': return `- Title override: '${text}'. Centerpiece of the design.`;
                case 'faceChange': return '- EXACT Face Injection: The face from the SECOND image must replace the face in the FIRST image.';
                case 'personChange': return '- Full Person Injection: The entity from the SECOND image replaces the subject in the FIRST image.';
                default: return '';
            }
        })
        .join('\n');

    return `
You are a top-tier YouTube Thumbnail Creative Director. Your goal is to maximize CTR (Click-Through Rate).
Original Thumbnail is Provided (IMAGE 1). 
${isPro ? "Use Google Search grounding to understand visual trends for '"+text+"' if relevant." : ""}

${options.faceChange || options.personChange ? "**MANDATORY: Identity Integrity.** The face from the SECOND image must be reproduced with 100% accuracy. Do not stylize it beyond basic lighting matching." : ""}

**Directives:**
- **Text:** "${text || 'Preserve/Enhance existing message'}"
- **Creative Intensity:** ${intensity}/10 (${intensityDescription})
- **Requested Modifications:**
${requestedChanges || "- Use professional judgement for a high-impact clone."}

**Output Spec:**
- ASPECT RATIO: ${aspectRatio}
- QUALITY: ${isPro ? "Ultra-High 2K Resolution" : "HD Quality"}
- No text response, only the resulting image.
`;
};

export const generateThumbnail = async ({ image, text, intensity, options, faceImage, personImage, isPro }: GenerateThumbnailParams & { isPro?: boolean }): Promise<string> => {
    const ai = getClient();
    const modelName = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    const prompt = buildPrompt(text, intensity, options, !!isPro);
    
    const imagePart = await fileToGenerativePart(image);
    const parts: Part[] = [imagePart];

    if (faceImage && options.faceChange) {
        parts.push(await fileToGenerativePart(faceImage));
    } else if (personImage && options.personChange) {
        parts.push(await fileToGenerativePart(personImage));
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
            ...(isPro ? { 
                imageConfig: { aspectRatio: options.aspectRatio, imageSize: "2K" },
                tools: [{ googleSearch: {} }] 
            } : {})
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
    }

    throw new Error('Creative synthesis failed to yield an image.');
};

export const editThumbnail = async ({ imageBase64, prompt }: EditThumbnailParams): Promise<string> => {
    const ai = getClient();
    const imagePart = {
        inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: 'image/png',
        },
    };

    const editPrompt = `Refine this thumbnail based on user feedback: "${prompt}". Maintain existing visual style. Output image only.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [imagePart, { text: editPrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
    }

    throw new Error('Image refinement failed.');
};
