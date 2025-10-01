import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { HexColorPicker } from 'react-colorful';
import { 
  Settings, 
  Palette, 
  Eye, 
  Move,
  RotateCw,
  Square
} from 'lucide-react';
import { Layer } from '../ImageEditor';

interface PropertiesSidebarProps {
  selectedLayer: Layer | undefined;
  onLayerUpdate: (updates: Partial<Layer>) => void;
}

export const PropertiesSidebar: React.FC<PropertiesSidebarProps> = ({
  selectedLayer,
  onLayerUpdate
}) => {
  if (!selectedLayer) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Properties</h2>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No layer selected</p>
            <p className="text-sm text-muted-foreground">
              Select a layer to edit its properties
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Properties</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedLayer.name}
        </p>
      </div>

      {/* Properties */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Basic Properties */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <Square className="w-4 h-4 text-primary" />
              <h3 className="font-medium">Basic</h3>
            </div>
            
            <div className="space-y-4">
              {/* Layer Name */}
              <div>
                <Label htmlFor="layer-name" className="text-sm">Name</Label>
                <Input
                  id="layer-name"
                  value={selectedLayer.name}
                  onChange={(e) => onLayerUpdate({ name: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Opacity */}
              <div>
                <Label className="text-sm">Opacity</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <Slider
                    value={[selectedLayer.opacity * 100]}
                    onValueChange={(value) => onLayerUpdate({ opacity: value[0] / 100 })}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">
                    {Math.round(selectedLayer.opacity * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Color Properties */}
          {selectedLayer.type !== 'image' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center space-x-2 mb-3">
                <Palette className="w-4 h-4 text-primary" />
                <h3 className="font-medium">Color</h3>
              </div>
              
              <div className="space-y-4">
                {/* Color Picker */}
                <div>
                  <Label className="text-sm">Fill Color</Label>
                  <div className="mt-2">
                    <HexColorPicker
                      color={selectedLayer.color || '#ffffff'}
                      onChange={(color) => onLayerUpdate({ color })}
                      style={{ width: '100%', height: '160px' }}
                    />
                  </div>
                  <Input
                    value={selectedLayer.color || '#ffffff'}
                    onChange={(e) => onLayerUpdate({ color: e.target.value })}
                    className="mt-2 font-mono text-sm"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <Separator />

          {/* Transform Properties */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <Move className="w-4 h-4 text-primary" />
              <h3 className="font-medium">Transform</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">X</Label>
                <Input
                  type="number"
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-sm">Y</Label>
                <Input
                  type="number"
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-sm">Width</Label>
                <Input
                  type="number"
                  className="mt-1"
                  placeholder="100"
                />
              </div>
              <div>
                <Label className="text-sm">Height</Label>
                <Input
                  type="number"
                  className="mt-1"
                  placeholder="100"
                />
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Layer States */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="font-medium">Visibility</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Visible</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLayerUpdate({ visible: !selectedLayer.visible })}
                  className={selectedLayer.visible ? 'bg-primary/10 text-primary' : ''}
                >
                  {selectedLayer.visible ? 'On' : 'Off'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Locked</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLayerUpdate({ locked: !selectedLayer.locked })}
                  className={selectedLayer.locked ? 'bg-destructive/10 text-destructive' : ''}
                >
                  {selectedLayer.locked ? 'Locked' : 'Unlocked'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};