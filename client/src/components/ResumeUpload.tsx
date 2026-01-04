import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadResume } from "@/hooks/use-profile";
import { UploadCloud, FileText, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ResumeUpload() {
  const { mutate: uploadResume, isPending } = useUploadResume();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadResume(acceptedFiles[0]);
    }
  }, [uploadResume]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isPending
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer bg-card hover:bg-accent/5",
          isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border",
          isPending && "pointer-events-none opacity-80"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="p-10 flex flex-col items-center justify-center text-center gap-4 min-h-[240px]">
          <AnimatePresence mode="wait">
            {isPending ? (
              <motion.div
                key="parsing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white shadow-xl shadow-primary/20">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-foreground">AI is reading your resume...</h3>
                  <p className="text-muted-foreground mt-2">Extracting skills, experience, and education</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  {isDragActive ? (
                    <UploadCloud className="w-8 h-8" />
                  ) : (
                    <FileText className="w-8 h-8" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold font-display text-foreground">
                    {isDragActive ? "Drop it like it's hot" : "Upload your Resume"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                    Drag and drop your PDF here, or click to browse. We'll use AI to autofill your profile.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <Sparkles className="w-3 h-3" />
                  <span>Powered by OpenAI</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
