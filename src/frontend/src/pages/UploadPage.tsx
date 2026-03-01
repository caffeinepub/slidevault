import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  File,
  FileUp,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useUploadPresentation } from "../hooks/useQueries";

const ACCEPTED_TYPES = [".ppt", ".pptx", ".pdf"];

export function UploadPage() {
  const navigate = useNavigate();
  const uploadPresentation = useUploadPresentation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!selectedFile) newErrors.file = "Please select a file";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!ACCEPTED_TYPES.includes(ext)) {
      setErrors((prev) => ({
        ...prev,
        file: "Only .ppt, .pptx, or .pdf files allowed",
      }));
      return;
    }
    setSelectedFile(file);
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!selectedFile) return;

    try {
      const bytes = await selectedFile.arrayBuffer();
      const uint8 = new Uint8Array(bytes);
      const blob = ExternalBlob.fromBytes(uint8).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      const presentation = await uploadPresentation.mutateAsync({
        title,
        description,
        file: blob,
      });

      toast.success("Presentation uploaded successfully!");
      void navigate({
        to: "/presentation/$id",
        params: { id: presentation.id },
      });
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
      setUploadProgress(0);
    }
  };

  const isUploading = uploadPresentation.isPending;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Upload Presentation
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a new presentation to SlideVault
          </p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Presentation Details
          </CardTitle>
          <CardDescription>
            Fill in the information about your presentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Q4 Product Roadmap"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn(
                  "bg-background border-border",
                  errors.title && "border-destructive",
                )}
                disabled={isUploading}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of the presentation content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(
                  "bg-background border-border resize-none min-h-[100px]",
                  errors.description && "border-destructive",
                )}
                disabled={isUploading}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            {/* File */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                File <span className="text-destructive">*</span>
              </Label>

              {!selectedFile ? (
                <button
                  type="button"
                  aria-label="Upload file by clicking or dropping"
                  className={cn(
                    "w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-150",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-primary/5",
                    errors.file && "border-destructive",
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports .ppt, .pptx, .pdf
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".ppt,.pptx,.pdf"
                    className="hidden"
                    onChange={(e) =>
                      handleFileSelect(e.target.files?.[0] ?? null)
                    }
                    disabled={isUploading}
                  />
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <File
                      className="h-4.5 w-4.5 text-primary"
                      style={{ height: "1.125rem", width: "1.125rem" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setUploadProgress(0);
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              {errors.file && (
                <p className="text-xs text-destructive">{errors.file}</p>
              )}
            </div>

            {/* Upload progress */}
            {isUploading && uploadProgress > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-mono text-primary">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </motion.div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isUploading}
              className="w-full h-11 font-semibold glow-teal-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Presentation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
