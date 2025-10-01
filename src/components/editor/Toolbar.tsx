import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Undo, 
  Redo, 
  Download,
  Save,
  Layers,
  Home
} from 'lucide-react';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onExport: (format: 'svg' | 'psd') => void;
  onNewUpload: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  onExport,
  onNewUpload
}) => {
  const navigate = useNavigate();
  return (
    <motion.div 
      className="h-16 editor-panel border-b flex items-center px-6 space-x-4"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center space-x-3 hover:bg-surface-hover p-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">AI Editor</span>
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* File Operations */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="toolbar-button"
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewUpload}
          className="toolbar-button"
        >
          <Upload className="w-4 h-4 mr-2" />
          New Image
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Edit Operations */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          className="toolbar-button"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          className="toolbar-button"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export Operations */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="toolbar-button"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport('svg')}
          className="toolbar-button"
        >
          <Download className="w-4 h-4 mr-2" />
          Export SVG
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onExport('psd')}
          className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PSD
        </Button>
      </div>
    </motion.div>
  );
};