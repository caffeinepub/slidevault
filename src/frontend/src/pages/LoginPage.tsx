import { Button } from "@/components/ui/button";
import { Presentation, Shield, Zap } from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

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
        >
          {/* Logo & Brand */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
                <div className="relative bg-card border border-border rounded-2xl p-4">
                  <img
                    src="/assets/generated/ppt-hub-logo-transparent.dim_80x80.png"
                    alt="SlideVault"
                    className="h-14 w-14 object-contain"
                  />
                </div>
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              SlideVault
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Secure presentation management & sharing
            </p>
          </div>

          {/* Card */}
          <div className="glass rounded-2xl p-8 shadow-card">
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Admin Access
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in with your Internet Identity to manage presentations and
              access requests.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {[
                { icon: Presentation, text: "Upload & manage presentations" },
                {
                  icon: Shield,
                  text: "Control access with approval workflow",
                },
                { icon: Zap, text: "Generate shareable QR codes instantly" },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.text} className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">
                      {feature.text}
                    </span>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="w-full h-11 font-semibold glow-teal-sm"
              size="lg"
            >
              {isLoggingIn || isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in with Internet Identity"
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
