import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toolbar } from './editor/Toolbar';
import { LayersSidebar } from './editor/LayersSidebar';
import { Canvas } from './editor/Canvas';
import { PropertiesSidebar } from './editor/PropertiesSidebar';
import { UploadArea } from './editor/UploadArea';

export interface Layer {
  id: string;
  name: string;
  type: 'image' | 'mask' | 'shape';
  visible: boolean;
  locked: boolean;
  color?: string;
  opacity: number;
  data: any; // Fabric.js object data
  thumbnail?: string;
}

export const ImageEditor: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    // Create initial image layer
    const imageLayer: Layer = {
      id: 'image-base',
      name: 'Background Image',
      type: 'image',
      visible: true,
      locked: false,
      opacity: 1,
      data: { src: imageUrl },
    };
    setLayers([imageLayer]);
    setSelectedLayerId(imageLayer.id);
  };

  const handleExport = async (format: 'svg' | 'psd') => {
    const imageId = (window as any).currentImageId;
    if (!imageId) {
      alert('No image uploaded. Please upload an image first.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_id: imageId,
          layers: layers,
          format: format
        })
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the file blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const selectedLayer = layers.find(layer => layer.id === selectedLayerId);

  if (!uploadedImage) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <UploadArea onImageUpload={handleImageUpload} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top Toolbar */}
      <Toolbar 
        onUndo={() => {}} 
        onRedo={() => {}} 
        onExport={handleExport}
        onNewUpload={() => setUploadedImage(null)}
      />
      
      {/* Main Editor Layout */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Layers */}
        <motion.div 
          className="w-80 editor-panel border-r"
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LayersSidebar
            layers={layers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={setSelectedLayerId}
            onLayerUpdate={updateLayer}
            onLayerDelete={(layerId) => {
              setLayers(prev => prev.filter(l => l.id !== layerId));
              if (selectedLayerId === layerId) setSelectedLayerId(null);
            }}
          />
        </motion.div>

        {/* Center Canvas */}
        <div className="flex-1 canvas-area flex items-center justify-center">
          <Canvas 
            imageUrl={uploadedImage}
            layers={layers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={setSelectedLayerId}
            onLayerUpdate={updateLayer}
          />
        </div>

        {/* Right Sidebar - Properties */}
        <motion.div 
          className="w-80 editor-panel border-l"
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PropertiesSidebar
            selectedLayer={selectedLayer}
            onLayerUpdate={(updates) => selectedLayer && updateLayer(selectedLayer.id, updates)}
          />
        </motion.div>
      </div>
    </div>
  );
};