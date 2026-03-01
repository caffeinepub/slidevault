import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  Download,
  Loader2,
  Mail,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useGetApprovedPresentation } from "../hooks/useQueries";

export function ViewPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const getApproved = useGetApprovedPresentation();

  const validate = () => {
    if (!email.trim()) {
      setEmailError("Email address is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setNotFound(false);
    setDownloadUrl(null);

    try {
      const blob = await getApproved.mutateAsync(email.trim().toLowerCase());
      setDownloadUrl(blob.getDirectURL());
    } catch {
      setNotFound(true);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      {/* Background decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-chart-5/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Brand */}
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
                <div className="relative bg-card border border-border rounded-2xl p-3">
                  <img
                    src="/assets/generated/ppt-hub-logo-transparent.dim_80x80.png"
                    alt="SlideVault"
                    className="h-10 w-10 object-contain"
                  />
                </div>
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Download Presentation
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your email to access an approved presentation
            </p>
          </div>

          {/* Form card */}
          <Card className="glass border-border">
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                        setNotFound(false);
                        setDownloadUrl(null);
                      }}
                      className={cn(
                        "pl-9 bg-background/60 border-border",
                        emailError && "border-destructive",
                      )}
                      disabled={getApproved.isPending}
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-destructive">{emailError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={getApproved.isPending}
                  className="w-full h-11 font-semibold glow-teal-sm"
                >
                  {getApproved.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Find My Presentation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result: Success */}
          {downloadUrl && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-success/30 bg-success/5">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-9 w-9 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Access Approved!
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Your presentation is ready to download.
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full border-success/30 text-success hover:bg-success/10"
                    variant="outline"
                  >
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Presentation
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Result: Not found */}
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-destructive/15 flex items-center justify-center shrink-0">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Not Found</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        No approved presentation was found for this email
                        address. Make sure your request has been approved by the
                        owner.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Help text */}
          <p className="text-center text-xs text-muted-foreground">
            Haven't requested access yet?{" "}
            <span className="text-primary">
              Use the QR code shared by the presentation owner.
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
