import { useRef, useState } from 'react';
import { PModal, PHeading, PButton, PText, PSpinner, PTag, PInlineNotification } from '@porsche-design-system/components-react';
import type { ScannedNutrition } from '../lib/types';
import { AddFoodModal } from './AddFoodModal';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatNumber } from '../lib/calculations';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' ? new GoogleGenerativeAI(API_KEY) : null;

async function analyzeImageWithGemini(file: File): Promise<ScannedNutrition> {
  if (!genAI) {
    throw new Error('API Key de Gemini no configurada o inválida. Por favor, revisá tu archivo .env');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
  
  const imageData = base64.split(',')[1];

  const prompt = `
    Analyze this nutrition label image and extract the nutritional information. 
    Return ONLY a JSON object with this exact structure:
    {
      "name": "Name of the food in Spanish",
      "calories_per_serving": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "sodium_mg": number,
      "serving_size_g": number,
      "servings_per_package": number,
      "confidence": number (between 0 and 1, estimation of how clear the image is)
    }
    If a value is not found, use 0. If serving size is in ml, treat as g.
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageData,
        mimeType: file.type
      }
    }
  ]);

  const response = await result.response;
  const text = response.text();
  const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
  return JSON.parse(jsonStr);
}

interface Props {
  open: boolean;
  onDismiss: () => void;
  theme: 'light' | 'dark';
}

type ScanState = 'idle' | 'scanning' | 'result' | 'error';

export function ScanModal({ open, onDismiss, theme }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [scanned, setScanned] = useState<ScannedNutrition | null>(null);
  const [showAddFood, setShowAddFood] = useState(false);

  const surfaceColor = theme === 'dark' ? '#212225' : '#f5f5f8';

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setScanState('scanning');
    try {
      const result = await analyzeImageWithGemini(file);
      setScanned(result);
      setScanState('result');
    } catch (error) {
      console.error('Scan error:', error);
      setScanState('error');
    }
  }

  function handleDismiss() {
    setScanState('idle');
    setPreview(null);
    setScanned(null);
    if (fileRef.current) fileRef.current.value = '';
    onDismiss();
  }

  function handleUseData() {
    setShowAddFood(true);
  }

  if (showAddFood && scanned) {
    return (
      <AddFoodModal
        open={true}
        onDismiss={() => { setShowAddFood(false); handleDismiss(); }}
        prefill={{
          name: scanned.name,
          calories_per_serving: scanned.calories_per_serving,
          protein_g: scanned.protein_g,
          carbs_g: scanned.carbs_g,
          fat_g: scanned.fat_g,
          sodium_mg: scanned.sodium_mg,
          serving_size_g: scanned.serving_size_g,
          servings_per_package: scanned.servings_per_package,
          servings_consumed: 1,
          scan_confidence: scanned.confidence,
          source: 'scan',
        }}
      />
    );
  }

  const inputCls = `hidden`;

  return (
    <PModal
      open={open}
      onDismiss={handleDismiss}
      theme={theme}
      fullscreen={{ base: true, s: false }}
    >
      <PHeading slot="header" size="medium" tag="h2" theme={theme}>
        Escanear etiqueta
      </PHeading>

      <div className="flex flex-col gap-4 py-2">
        {scanState === 'idle' && (
          <>
            <PText theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
              Tomá una foto de la parte trasera del paquete o la etiqueta nutricional. La app va a leer automáticamente los valores.
            </PText>

            <div
              className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 p-8 cursor-pointer"
              style={{ borderColor: theme === 'dark' ? '#535457' : '#afb0b3' }}
              onClick={() => fileRef.current?.click()}
            >
              <span className="text-4xl">📷</span>
              <PText weight="semi-bold" theme={theme}>Tocar para abrir cámara o galería</PText>
              <PText size="small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                Soporta JPG, PNG — máx 20MB
              </PText>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className={inputCls}
              onChange={handleFileChange}
            />

            <PInlineNotification
              state="info"
              heading="Escaneo por IA"
              description="La aplicación utiliza inteligencia artificial para analizar la etiqueta nutricional en tiempo real y extraer los datos."
              dismissButton={false}
              theme={theme}
            />
          </>
        )}

        {scanState === 'scanning' && (
          <div className="flex flex-col items-center gap-4 py-8">
            {preview && (
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={preview}
                  alt="Preview"
                  className="object-cover"
                  style={{ maxHeight: 300, maxWidth: '100%' }}
                />
                <div className="scan-line" />
              </div>
            )}
            {!preview && <PSpinner size="medium" theme={theme} aria={{ 'aria-label': 'Escaneando...' }} />}
            <PText theme={theme} weight="semi-bold" className="animate-pulse">Analizando etiqueta nutricional...</PText>
            <PText size="x-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
              Detectando valores nutricionales, porciones y texto...
            </PText>
          </div>
        )}


        {scanState === 'result' && scanned && (
          <div className="flex flex-col gap-4">
            {preview && (
              <img
                src={preview}
                alt="Etiqueta escaneada"
                className="rounded-xl object-cover w-full"
                style={{ maxHeight: 180 }}
              />
            )}

            <div className="flex items-center gap-2">
              <PTag
                variant={scanned.confidence >= 0.8 ? 'success' : 'warning'}
                icon={scanned.confidence >= 0.8 ? 'check' : 'exclamation'}
                theme={theme}
              >
                Confianza: {Math.round(scanned.confidence * 100)}%
              </PTag>
              <PText size="small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                {scanned.confidence < 0.8 ? 'Verificar los datos antes de guardar' : 'Datos extraídos correctamente'}
              </PText>
            </div>

            <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: surfaceColor }}>
              <PText weight="semi-bold" theme={theme}>{scanned.name}</PText>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: 'Cal/porción', value: `${formatNumber(scanned.calories_per_serving)} kcal` },
                  { label: 'Tamaño porción', value: `${formatNumber(scanned.serving_size_g)}g` },
                  { label: 'Porciones/paquete', value: formatNumber(scanned.servings_per_package, 1) },
                  { label: 'Paquete completo', value: `${formatNumber(scanned.calories_per_serving * scanned.servings_per_package)} kcal` },
                  { label: 'Proteína', value: `${formatNumber(scanned.protein_g, 1)}g` },
                  { label: 'Carbos', value: `${formatNumber(scanned.carbs_g, 1)}g` },
                  { label: 'Grasa', value: `${formatNumber(scanned.fat_g, 1)}g` },
                  { label: 'Sodio', value: `${formatNumber(scanned.sodium_mg)}mg` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                      {label}
                    </PText>
                    <PText size="small" weight="semi-bold" theme={theme}>{value}</PText>
                  </div>
                ))}
              </div>
            </div>

            <PText size="small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
              Podés editar todos los valores en el siguiente paso.
            </PText>
          </div>
        )}

        {scanState === 'error' && (
          <PInlineNotification
            state="error"
            heading="Error al escanear"
            description="No se pudo leer la etiqueta. Intentá con mejor iluminación o ingresá los datos manualmente."
            dismissButton={false}
            theme={theme}
          />
        )}
      </div>

      <div slot="footer" className="flex gap-2">
        {scanState === 'result' && scanned && (
          <PButton variant="primary" icon="check" onClick={handleUseData} theme={theme}>
            Usar estos datos
          </PButton>
        )}
        {scanState === 'error' && (
          <PButton variant="secondary" onClick={() => setScanState('idle')} theme={theme}>
            Reintentar
          </PButton>
        )}
        <PButton variant={scanState === 'result' ? 'secondary' : 'primary'} onClick={handleDismiss} theme={theme}>
          {scanState === 'result' ? 'Cancelar' : 'Cerrar'}
        </PButton>
      </div>
    </PModal>
  );
}
