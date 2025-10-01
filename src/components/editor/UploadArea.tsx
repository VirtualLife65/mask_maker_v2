import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadAreaProps {
  onImageUpload: (imageUrl: string) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPEG, etc.)');
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload to backend API
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const uploadData = await response.json();
      
      // Store the image ID for later use
      (window as any).currentImageId = uploadData.image_id;
      
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      
      onImageUpload(imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  return (
    <motion.div
      className="max-w-2xl w-full mx-auto p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Image className="w-8 h-8 text-primary" />
        </motion.div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          AI Image Editor
        </h1>
        <p className="text-muted-foreground text-lg">
          Upload an image to start editing with AI-powered segmentation
        </p>
      </div>

      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-border hover:border-primary/50 hover:bg-surface/50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <motion.div
          className="flex flex-col items-center space-y-4"
          animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
        >
          <div className="flex items-center justify-center w-20 h-20 bg-surface rounded-full">
            <Upload className={`w-10 h-10 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          
          <div>
            <p className="text-xl font-semibold mb-2">
              {isDragging 
                ? 'Drop your image here' 
                : isUploading 
                  ? 'Uploading...' 
                  : 'Drag & drop your image here'
              }
            </p>
            <p className="text-muted-foreground">
              or click to browse your files
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="mt-4"
            disabled={isUploading}
          >
            {isUploading ? 'Processing...' : 'Choose File'}
          </Button>
        </motion.div>
      </motion.div>

      <div className="mt-8 flex justify-center space-x-8 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>PNG, JPEG supported</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Max 20MB</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>AI-powered segmentation</span>
        </div>
      </div>
    </motion.div>
  );
};