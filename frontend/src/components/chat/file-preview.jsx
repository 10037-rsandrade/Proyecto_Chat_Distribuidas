import { Paperclip, FileText, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export function FilePreview({ fileId, fileName, fileType }) {
  const [imageError, setImageError] = useState(false);
  const isImage = fileType?.startsWith('image/') && !imageError;
  const fileUrl = `http://10.40.51.240:80/api/files/${fileId}`;

  if (isImage) {
    return (
      <div className="mt-2 max-w-sm">
        <img
          src={fileUrl}
          alt={fileName}
          className="rounded-lg max-h-48 object-cover w-full"
          loading="lazy"
          onError={() => setImageError(true)}
        />
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-blue-500 hover:text-blue-600 mt-1"
        >
          <ImageIcon className="h-3 w-3" />
          {fileName}
        </a>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
      >
        {fileType?.includes('pdf') ? (
          <FileText className="h-4 w-4" />
        ) : (
          <Paperclip className="h-4 w-4" />
        )}
        {fileName}
      </a>
    </div>
  );
} 