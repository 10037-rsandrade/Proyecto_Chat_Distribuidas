import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal } from "lucide-react";
import { useState } from "react";
import { FileUpload } from "./file-upload";
import { useToast } from "@/hooks/use-toast";

export function MessageInput({ onSendMessage }) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || isUploading) return;

    try {
      setIsUploading(true);
      let fileData = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
          const response = await fetch("http://10.40.51.240:80/api/files/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(response.statusText || "Error al subir el archivo");
          }

          fileData = await response.json();
          console.log("Archivo subido:", fileData);

          // Asegurarnos de que tenemos el tipo de archivo
          if (!fileData.fileType && selectedFile.type) {
            fileData.fileType = selectedFile.type;
          }
        } catch (error) {
          console.error("Error al subir archivo:", error);
          toast({
            variant: "destructive",
            title: "Error al subir archivo",
            description: "No se pudo subir el archivo. Por favor, intenta con un archivo más pequeño o en otro formato."
          });
          setIsUploading(false);
          return;
        }
      }

      const messageData = {
        content: message || (fileData ? `Archivo adjunto: ${fileData.fileName}` : ""),
        type: fileData ? "FILE" : "CHAT",
        hasAttachment: !!fileData,
        fileId: fileData?.id,
        fileName: fileData?.fileName,
        fileType: fileData?.fileType || selectedFile?.type // Usar el tipo del archivo original si no viene del servidor
      };

      console.log("Enviando mensaje:", messageData);
      onSendMessage(messageData);
      setMessage("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje. Por favor, intenta de nuevo."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-2">
      {selectedFile && (
        <div className="px-2">
          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onClearFile={() => setSelectedFile(null)}
          />
        </div>
      )}
      <div className="flex gap-2">
        {!selectedFile && (
          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onClearFile={() => setSelectedFile(null)}
          />
        )}
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe un mensaje..."
          className="flex-1"
          disabled={isUploading}
        />
        <Button 
          type="submit" 
          size="icon" 
          variant="secondary"
          disabled={isUploading}
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
} 