import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Image as FabricImage, Rect, FabricObject } from 'fabric';
import { motion } from 'framer-motion';
import { Layer } from '../ImageEditor';

interface CanvasProps {
  imageUrl: string;
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerSelect: (layerId: string | null) => void;  
  onLayerUpdate: (layerId: string, updates: Partial<Layer>) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  imageUrl,
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const fabricObjectsRef = useRef<Map<string, FabricObject>>(new Map());

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: 'transparent',
      selection: true,
    });

    setFabricCanvas(canvas);

    // Handle object selection
    canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0];
      if (obj && (obj as any).layerId) {
        onLayerSelect((obj as any).layerId);
      }
    });

    canvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0];
      if (obj && (obj as any).layerId) {
        onLayerSelect((obj as any).layerId);
      }
    });

    canvas.on('selection:cleared', () => {
      onLayerSelect(null);
    });

    return () => {
      canvas.dispose();
    };
  }, [onLayerSelect]);

  // Load main image
  useEffect(() => {
    if (!fabricCanvas || !imageUrl) return;

    FabricImage.fromURL(imageUrl, {
      crossOrigin: 'anonymous',
    }).then((img) => {
      // Scale image to fit canvas while maintaining aspect ratio
      const canvasWidth = fabricCanvas.width || 800;
      const canvasHeight = fabricCanvas.height || 600;
      const imgWidth = img.width || 1;
      const imgHeight = img.height || 1;
      
      const scale = Math.min(
        (canvasWidth * 0.8) / imgWidth,
        (canvasHeight * 0.8) / imgHeight
      );
      
      img.scale(scale);
      img.set({
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
        selectable: false,
        evented: false,
      });

      // Add custom properties for layer identification
      (img as any).layerId = 'image-base';
      (img as any).layerType = 'image';

      fabricCanvas.add(img);
      fabricCanvas.renderAll();
      
      fabricObjectsRef.current.set('image-base', img);
    });
  }, [fabricCanvas, imageUrl]);

  // Sync layers with canvas objects
  useEffect(() => {
    if (!fabricCanvas) return;

    layers.forEach(layer => {
      const existingObj = fabricObjectsRef.current.get(layer.id);
      
      if (existingObj) {
        // Update existing object
        existingObj.set({
          visible: layer.visible,
          selectable: !layer.locked,
          evented: !layer.locked,
          opacity: layer.opacity,
        });

        if (layer.color && layer.type === 'mask') {
          existingObj.set('fill', layer.color);
        }
      }
    });

    fabricCanvas.renderAll();
  }, [fabricCanvas, layers]);

  // Handle layer selection from sidebar
  useEffect(() => {
    if (!fabricCanvas || !selectedLayerId) {
      fabricCanvas?.discardActiveObject();
      fabricCanvas?.renderAll();
      return;
    }

    const obj = fabricObjectsRef.current.get(selectedLayerId);
    if (obj && obj.selectable) {
      fabricCanvas.setActiveObject(obj);
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas, selectedLayerId]);

  // Get AI segments from backend API
  const handleGetSegments = async () => {
    if (!fabricCanvas) return;

    const imageId = (window as any).currentImageId;
    if (!imageId) {
      alert('No image uploaded. Please upload an image first.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/segments/${imageId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Segmentation failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      const segments = data.segments;

      // Add segments to canvas
      segments.forEach((segment: any) => {
        // Create a path from SVG path data
        const path = new Path(segment.path, {
          left: 0,
          top: 0,
          fill: segment.color,
          opacity: 0.7,
          selectable: true,
        });

        // Add custom properties for layer identification
        (path as any).layerId = segment.id;
        (path as any).layerType = 'mask';

        fabricCanvas.add(path);
        fabricObjectsRef.current.set(segment.id, path);
        
        // Add to layers list
        const newLayer: Layer = {
          id: segment.id,
          name: segment.name,
          type: 'mask',
          visible: true,
          locked: false,
          color: segment.color,
          opacity: 0.7,
          data: segment
        };
        
        onLayerUpdate(segment.id, newLayer);
      });

      fabricCanvas.renderAll();
    } catch (error) {
      console.error('Segmentation failed:', error);
      alert('Failed to generate segments. Please try again.');
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center space-y-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Canvas */}
      <div className="relative border border-border rounded-lg overflow-hidden shadow-soft">
        <canvas 
          ref={canvasRef}
          className="block"
        />
      </div>

      {/* AI Segmentation Button */}
      <motion.button
        onClick={handleGetSegments}
        className="px-6 py-3 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground rounded-lg font-medium hover:shadow-glow transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🧠 Generate AI Segments
      </motion.button>
    </motion.div>
  );
};