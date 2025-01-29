import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB en bytes
const ALLOWED_FILE_TYPES = {
  'image/jpeg': true,
  'image/png': true,
  'image/gif': true,
  'application/pdf': true,
  'application/msword': true,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
  'text/plain': true
};

export function FileUpload({ selectedFile, onFileSelect, onClearFile }) {
  const { toast } = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES[file.type]) {
      toast({
        variant: "destructive",
        title: "Tipo de archivo no permitido",
        description: "Por favor, selecciona una imagen, PDF, documento Word o archivo de texto."
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "Archivo demasiado grande",
        description: "El archivo no debe superar los 10MB."
      });
      return;
    }

    onFileSelect(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex items-center gap-2">
      {selectedFile ? (
        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-1">
          <span className="text-sm truncate max-w-[200px]">
            {selectedFile.name}
            <span className="text-xs text-muted-foreground ml-1">
              ({formatFileSize(selectedFile.size)})
            </span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onClearFile()}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9",
              selectedFile && "bg-muted"
            )}
            title="Adjuntar archivo (máx. 10MB)"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 