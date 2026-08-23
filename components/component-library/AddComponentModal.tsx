import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { KitComponent, ComponentCategory, NewComponentForm } from '@/types';
import { KIT_COMPONENTS } from '@/data/components';
import { XIcon, PlusIcon, SparklesIcon, LayersIcon, UploadIcon, ImageIcon, Trash2Icon } from '../icons/Icons';

interface AddComponentModalProps {
  isOpen: boolean;
  initialCategory?: ComponentCategory;
  onClose: () => void;
  onAddComponent: (component: KitComponent) => void;
}

// Preset icon/image choices by category for visual thumbnail selection
const IMAGE_PRESETS: { label: string; src: string; category: ComponentCategory }[] = [
  { label: 'Tactile Button', src: '/assets/input/tactile_button.png', category: 'input' },
  { label: 'Potentiometer', src: '/assets/input/potentio.png', category: 'input' },
  { label: 'DHT22 Sensor', src: '/assets/input/dht22.png', category: 'input' },
  { label: 'IR Motion', src: '/assets/input/infra_red.png', category: 'input' },
  { label: 'ESP32 Core', src: '/assets/board/esp32.png', category: 'board' },
  { label: 'Arduino Uno', src: '/assets/board/arduino.png', category: 'board' },
  { label: 'Raspberry Pi', src: '/assets/board/RPI.png', category: 'board' },
  { label: 'LED Lamp', src: '/assets/output/led.png', category: 'output' },
  { label: 'Active Buzzer', src: '/assets/output/buzzer.png', category: 'output' },
  { label: 'Micro Servo', src: '/assets/output/servo.png', category: 'output' },
  { label: 'LED Matrix', src: '/assets/output/led-matrix.png', category: 'output' },
  { label: 'Resistor Module', src: '/assets/conditioner/resistor.png', category: 'conditioner' },
];

const COMPONENT_PRESETS: {
  category: ComponentCategory;
  name: string;
  type: string;
  description: string;
  pinInfo: string;
  defaultGpio: string;
  statusBadge: string;
  image: string;
}[] = [
  {
    category: 'input',
    name: 'LDR Photoresistor',
    type: 'Analog Light Sensor',
    description: 'Light dependent resistor module for ambient brightness detection.',
    pinInfo: 'GPIO 32 (ADC1)',
    defaultGpio: '32',
    statusBadge: 'Analog 12-Bit',
    image: '/assets/input/potentio.png',
  },
  {
    category: 'input',
    name: 'PIR Motion Sensor',
    type: 'Digital Pyroelectric',
    description: 'Passive infrared human motion detector with adjustable delay.',
    pinInfo: 'GPIO 27',
    defaultGpio: '27',
    statusBadge: 'Active High',
    image: '/assets/input/infra_red.png',
  },
  {
    category: 'board',
    name: 'ESP32-S3 Mini',
    type: 'Xtensa LX7 Dual-Core',
    description: 'Compact 2.4GHz Wi-Fi and Bluetooth 5 (LE) development module.',
    pinInfo: '24 GPIO Pins',
    defaultGpio: '',
    statusBadge: 'ESP32-S3 MCU',
    image: '/assets/board/esp32.png',
  },
  {
    category: 'output',
    name: '5V Relay Module',
    type: 'Optocoupler Relay',
    description: 'Electromechanical relay for switching high voltage / current AC/DC loads.',
    pinInfo: 'GPIO 25',
    defaultGpio: '25',
    statusBadge: 'Opto-Isolated',
    image: '/assets/output/led.png',
  },
  {
    category: 'output',
    name: '0.96" OLED Display',
    type: 'I2C Monochrome OLED',
    description: '128x64 pixel graphic display module with SSD1306 driver.',
    pinInfo: 'GPIO 21 (SDA), 22 (SCL)',
    defaultGpio: '21',
    statusBadge: 'I2C 0x3C',
    image: '/assets/output/led-matrix.png',
  },
  {
    category: 'conditioner',
    name: 'Logic Level Shifter',
    type: 'Bidirectional Converter',
    description: '4-channel 3.3V to 5.0V bidirectional level translator.',
    pinInfo: 'HV / LV Shifter',
    defaultGpio: '',
    statusBadge: '3.3V ➔ 5V',
    image: '/assets/conditioner/resistor.png',
  },
];

// Helper to resize and compress uploaded image to max 128x128 DataURL
const optimizeUploadedImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 128;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png', 0.9);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const AddComponentModal: React.FC<AddComponentModalProps> = ({
  isOpen,
  initialCategory = 'input',
  onClose,
  onAddComponent,
}) => {
  const [formData, setFormData] = useState<NewComponentForm>({
    category: initialCategory,
    name: '',
    type: '',
    description: '',
    pinInfo: '',
    defaultGpio: '',
    statusBadge: '',
    image: '/assets/input/tactile_button.png',
    requiredConditionerId: '',
    requiredConditionerName: '',
  });

  const [imageMode, setImageMode] = useState<'preset' | 'upload'>('preset');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync category when initialCategory changes
  useEffect(() => {
    if (isOpen) {
      const defaultImg =
        initialCategory === 'input'
          ? '/assets/input/tactile_button.png'
          : initialCategory === 'board'
          ? '/assets/board/esp32.png'
          : initialCategory === 'output'
          ? '/assets/output/led.png'
          : '/assets/conditioner/resistor.png';

      setFormData((prev) => ({
        ...prev,
        category: initialCategory,
        image: defaultImg,
      }));
      setImageMode('preset');
      setUploadedImagePreview(null);
      setValidationError(null);
    }
  }, [isOpen, initialCategory]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof COMPONENT_PRESETS[0]) => {
    setFormData({
      category: preset.category,
      name: preset.name,
      type: preset.type,
      description: preset.description,
      pinInfo: preset.pinInfo,
      defaultGpio: preset.defaultGpio,
      statusBadge: preset.statusBadge,
      image: preset.image,
      requiredConditionerId: '',
      requiredConditionerName: '',
    });
    setImageMode('preset');
    setUploadedImagePreview(null);
    setValidationError(null);
  };

  const handleCategoryChange = (cat: ComponentCategory) => {
    const defaultImg =
      cat === 'input'
        ? '/assets/input/tactile_button.png'
        : cat === 'board'
        ? '/assets/board/esp32.png'
        : cat === 'output'
        ? '/assets/output/led.png'
        : '/assets/conditioner/resistor.png';

    setFormData((prev) => ({
      ...prev,
      category: cat,
      image: uploadedImagePreview || defaultImg,
      requiredConditionerId: cat === 'output' ? prev.requiredConditionerId : '',
      requiredConditionerName: cat === 'output' ? prev.requiredConditionerName : '',
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationError('Please select a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    setIsUploading(true);
    try {
      const optimizedDataUrl = await optimizeUploadedImage(file);
      setUploadedImagePreview(optimizedDataUrl);
      setFormData((prev) => ({ ...prev, image: optimizedDataUrl }));
      setImageMode('upload');
      setValidationError(null);
    } catch (err) {
      console.error('Failed to process image upload', err);
      setValidationError('Failed to process uploaded image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveUploadedImage = () => {
    setUploadedImagePreview(null);
    setImageMode('preset');
    const defaultImg =
      formData.category === 'input'
        ? '/assets/input/tactile_button.png'
        : formData.category === 'board'
        ? '/assets/board/esp32.png'
        : formData.category === 'output'
        ? '/assets/output/led.png'
        : '/assets/conditioner/resistor.png';

    setFormData((prev) => ({ ...prev, image: defaultImg }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setValidationError('Component name is required.');
      return;
    }

    const idSlug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueId = `custom-${idSlug || 'comp'}-${Date.now().toString().slice(-4)}`;

    const newComponent: KitComponent = {
      id: uniqueId,
      name: formData.name.trim(),
      category: formData.category,
      type: formData.type.trim() || `${formData.category.toUpperCase()} Module`,
      description: formData.description.trim() || `Custom ${formData.category} component added by user.`,
      image: formData.image || '/assets/input/tactile_button.png',
      pinInfo: formData.pinInfo.trim() || (formData.defaultGpio ? `GPIO ${formData.defaultGpio}` : undefined),
      defaultGpio: formData.defaultGpio.trim() || undefined,
      statusBadge: formData.statusBadge.trim() || 'Custom Added',
      requiredConditionerId: formData.requiredConditionerId || undefined,
      requiredConditionerName: formData.requiredConditionerName || undefined,
      isCustom: true,
    };

    onAddComponent(newComponent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-xl bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
              <PlusIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-900 leading-tight">
                Add New Kit Component
              </h2>
              <p className="text-[11px] text-zinc-500">
                Register a new hardware component or upload photos to the workspace library.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
          {validationError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[11px] font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div>
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold mb-1.5">
              <SparklesIcon className="w-3 h-3 text-amber-500" />
              <span>Quick Template Presets:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMPONENT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2 py-1 bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-zinc-200 rounded-md text-[10.5px] text-zinc-700 font-medium transition-colors cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector Tabs */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5 uppercase text-[10px] tracking-wider font-mono">
              Component Category *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'input', label: 'INPUT', desc: 'Sensors / Switches' },
                  { id: 'board', label: 'DEVICE', desc: 'MCU / Core' },
                  { id: 'output', label: 'OUTPUT', desc: 'Actuators / LEDs' },
                  { id: 'conditioner', label: 'CONDITIONER', desc: 'Filter / Resistor' },
                ] as const
              ).map((cat) => {
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-2 ring-blue-100'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <span
                      className={`font-bold text-[11px] uppercase ${
                        isSelected ? 'text-blue-900' : 'text-zinc-800'
                      }`}
                    >
                      {cat.label}
                    </span>
                    <span className="text-[9px] text-zinc-400 leading-tight mt-0.5">{cat.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Subtype Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Component Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setValidationError(null);
                }}
                placeholder="e.g. OLED Display 0.96"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Interface / Subtype
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g. I2C Display / Digital In"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Pinout & Status Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-700 mb-1">
                Pinout / Connection Info
              </label>
              <input
                type="text"
                value={formData.pinInfo}
                onChange={(e) => setFormData({ ...formData, pinInfo: e.target.value })}
                placeholder="e.g. GPIO 21 (SDA), 22 (SCL)"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-mono text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Default GPIO #
              </label>
              <input
                type="text"
                value={formData.defaultGpio}
                onChange={(e) => setFormData({ ...formData, defaultGpio: e.target.value })}
                placeholder="e.g. 21"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-mono text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Description & Specifications
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Technical summary of this sensor or component..."
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            />
          </div>

          {/* Hardware Photo & Thumbnail Section (Dual Mode: Presets OR Upload Photo) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider font-mono">
                Component Photo / Thumbnail
              </label>

              {/* Mode Switcher */}
              <div className="flex items-center bg-zinc-200/70 p-0.5 rounded-md text-[10.5px]">
                <button
                  type="button"
                  onClick={() => setImageMode('preset')}
                  className={`px-2 py-0.5 rounded font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    imageMode === 'preset'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Preset Icons</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageMode('upload');
                    if (!uploadedImagePreview && fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                  className={`px-2 py-0.5 rounded font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    imageMode === 'upload'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <UploadIcon className="w-3 h-3" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* MODE 1: PRESETS GRID */}
            {imageMode === 'preset' && (
              <div className="grid grid-cols-6 sm:grid-cols-6 gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-xl">
                {IMAGE_PRESETS.map((imgPreset, idx) => {
                  const isSelected = formData.image === imgPreset.src;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: imgPreset.src })}
                      className={`h-14 rounded-lg border p-1 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-white ring-2 ring-blue-200 shadow-xs'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 opacity-70 hover:opacity-100'
                      }`}
                      title={imgPreset.label}
                    >
                      <Image
                        src={imgPreset.src}
                        alt={imgPreset.label}
                        width={32}
                        height={32}
                        className="object-contain max-h-7 max-w-7"
                        unoptimized
                      />
                      <span className="text-[8px] text-zinc-600 truncate max-w-full font-mono">
                        {imgPreset.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* MODE 2: UPLOAD PHOTO AREA */}
            {imageMode === 'upload' && (
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col items-center justify-center text-center">
                {formData.image.startsWith('data:') || uploadedImagePreview ? (
                  /* Uploaded Image Live Preview */
                  <div className="flex items-center gap-4 w-full p-2 bg-white rounded-lg border border-zinc-200">
                    <div className="w-16 h-16 rounded-lg bg-zinc-50 border border-zinc-200 p-1 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={formData.image}
                        alt="Uploaded Component Photo"
                        width={56}
                        height={56}
                        className="object-contain max-h-14 max-w-14 drop-shadow-sm"
                        unoptimized
                      />
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <span className="font-semibold text-zinc-800 text-xs block">
                        Custom Photo Uploaded
                      </span>
                      <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1 mt-0.5">
                        ✓ Ready to display in library & canvas
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveUploadedImage}
                          className="px-2 py-0.5 rounded text-red-600 hover:bg-red-50 text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2Icon className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty Upload Dropzone */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-5 px-4 border-2 border-dashed border-zinc-300 hover:border-blue-400 hover:bg-blue-50/40 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                      <UploadIcon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-zinc-700 text-xs group-hover:text-blue-700">
                      {isUploading ? 'Optimizing Image...' : 'Click to Upload Component Photo'}
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">
                      Supports PNG, JPG, WEBP, SVG (Auto-scaled for optimal performance)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Output Conditioner Dependency (Only shown for OUTPUT category) */}
          {formData.category === 'output' && (
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-[11px]">
                <LayersIcon className="w-3.5 h-3.5" />
                <span>Conditioner Add-on Dependency (Optional)</span>
              </div>
              <p className="text-[10.5px] text-amber-700 leading-snug">
                Require a protection or filter component (e.g., 220Ω Resistor) before output channel activates.
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={formData.requiredConditionerId || ''}
                  onChange={(e) => {
                    const selected = KIT_COMPONENTS.find((c) => c.id === e.target.value);
                    setFormData({
                      ...formData,
                      requiredConditionerId: e.target.value || undefined,
                      requiredConditionerName: selected?.name || undefined,
                    });
                  }}
                  className="px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="">No Conditioner Required (Direct Connection)</option>
                  <option value="resistor-220">Requires 220Ω Resistor (LED/Diode Protection)</option>
                  <option value="resistor-10k">Requires 10kΩ Resistor (Pull-up / Pull-down)</option>
                  <option value="capacitor-100nf">Requires 100nF Capacitor (Noise Filter)</option>
                </select>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 font-medium text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Add to Component Library</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
