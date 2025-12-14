import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

export default function ImageUpload({ onImageUpload, maxImages = 1, existingImages = [] }) {
  const [images, setImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 80% quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} image${maxImages > 1 ? 's' : ''} allowed`);
      return;
    }

    setUploading(true);

    try {
      const compressedImages = await Promise.all(
        files.map(async (file) => {
          if (!file.type.startsWith('image/')) {
            toast.error('Please select image files only');
            return null;
          }
          
          if (file.size > 10 * 1024 * 1024) {
            toast.error('Image too large (max 10MB)');
            return null;
          }

          const compressed = await compressImage(file);
          return compressed;
        })
      );

      const validImages = compressedImages.filter(img => img !== null);
      const newImages = [...images, ...validImages];
      setImages(newImages);
      onImageUpload(newImages);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImageUpload(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Upload ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border border-border"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-ferment-green hover:bg-ferment-green/5 transition-all cursor-pointer"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ferment-green"></div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={maxImages > 1}
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        {maxImages > 1 ? `Add up to ${maxImages} photos` : 'Add 1 photo'}. Images will be compressed automatically.
      </p>
    </div>
  );
}
