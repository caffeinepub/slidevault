import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  Presentation as FilePresentation,
  Loader2,
  Mail,
  Send,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetPresentation, useSubmitViewRequest } from "../hooks/useQueries";

export function RequestPage() {
  const { presentationId } = useParams({ from: "/request/$presentationId" });
  const navigate = useNavigate();

  const {
    data: presentation,
    isLoading,
    error,
  } = useGetPresentation(presentationId);
  const submitRequest = useSubmitViewRequest();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await submitRequest.mutateAsync({
        presentationId,
        guestName: name.trim(),
        guestEmail: email.trim().toLowerCase(),
      });
      void navigate({ to: "/request-submitted" });
    } catch {
      toast.error("Failed to submit request. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">
            Presentation Not Found
          </h2>
          <p className="text-sm text-muted-foreground">
            This link may be invalid or the presentation has been removed.
          </p>
        </div>
      </div>
    );
  }

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
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Brand */}
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FilePresentation className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-sm font-mono text-muted-foreground">
              SlideVault
            </p>
          </div>

          {/* Presentation info */}
          <Card className="glass border-border">
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : presentation ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <FilePresentation className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h1 className="font-display text-lg font-bold text-foreground">
                        {presentation.title}
                      </h1>
                      <p className="text-sm text-muted-foreground mt-1">
                        {presentation.description}
                      </p>
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Request form */}
          <Card className="glass border-border">
            <CardContent className="p-5">
              <h2 className="font-display text-base font-semibold text-foreground mb-1">
                Request Access
              </h2>
              <p className="text-xs text-muted-foreground mb-5">
                Enter your details to request access to this presentation. The
                owner will review your request.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn(
                        "pl-9 bg-background/60 border-border",
                        errors.name && "border-destructive",
                      )}
                      disabled={submitRequest.isPending}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        "pl-9 bg-background/60 border-border",
                        errors.email && "border-destructive",
                      )}
                      disabled={submitRequest.isPending}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitRequest.isPending}
                  className="w-full h-11 font-semibold glow-teal-sm mt-2"
                >
                  {submitRequest.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Request Access
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
