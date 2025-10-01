import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy,
  Image,
  Layers,
  Square
} from 'lucide-react';
import { Layer } from '../ImageEditor';

interface LayersSidebarProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerUpdate: (layerId: string, updates: Partial<Layer>) => void;
  onLayerDelete: (layerId: string) => void;
}

export const LayersSidebar: React.FC<LayersSidebarProps> = ({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerUpdate,
  onLayerDelete
}) => {
  const getLayerIcon = (layer: Layer) => {
    switch (layer.type) {
      case 'image': return Image;
      case 'mask': return Square;
      case 'shape': return Square;
      default: return Layers;
    }
  };

  const handleDuplicateLayer = (layer: Layer) => {
    const newLayer: Layer = {
      ...layer,
      id: `${layer.id}-copy-${Date.now()}`,
      name: `${layer.name} Copy`,
    };
    onLayerUpdate(newLayer.id, newLayer);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Layers</h2>
        </div>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          <AnimatePresence>
            {layers.map((layer, index) => {
              const Icon = getLayerIcon(layer);
              const isSelected = selectedLayerId === layer.id;

              return (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`
                    layer-item rounded-lg p-3 cursor-pointer transition-all duration-200
                    ${isSelected ? 'layer-active' : ''}
                  `}
                  onClick={() => onLayerSelect(layer.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    {/* Layer Icon */}
                    <div className="flex-shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>

                    {/* Layer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {layer.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {layer.type} • {Math.round(layer.opacity * 100)}%
                      </div>
                    </div>

                    {/* Layer Controls */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLayerUpdate(layer.id, { visible: !layer.visible });
                        }}
                      >
                        {layer.visible ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-muted-foreground" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLayerUpdate(layer.id, { locked: !layer.locked });
                        }}
                      >
                        {layer.locked ? (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <Unlock className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Layer Color Indicator */}
                  {layer.color && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="text-xs text-muted-foreground font-mono">
                        {layer.color}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {layers.length === 0 && (
          <div className="text-center py-12">
            <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No layers yet</p>
            <p className="text-sm text-muted-foreground">
              Upload an image to get started
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Layer Actions */}
      {selectedLayerId && (
        <motion.div
          className="p-4 border-t border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                const layer = layers.find(l => l.id === selectedLayerId);
                if (layer) handleDuplicateLayer(layer);
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => selectedLayerId && onLayerDelete(selectedLayerId)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};