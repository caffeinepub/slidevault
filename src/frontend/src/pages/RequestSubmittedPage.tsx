import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
import { motion } from "motion/react";

export function RequestSubmittedPage() {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      {/* Background decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-success/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Success icon */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-success/20 blur-2xl scale-150" />
              <div className="relative h-20 w-20 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
            </motion.div>
          </div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">
              Request Submitted!
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              Your access request has been submitted successfully. The
              presentation owner will review it and you'll be notified once
              approved.
            </p>
          </motion.div>

          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass rounded-xl p-4 text-left"
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-0.5">
                  What happens next?
                </p>
                <p className="text-xs text-muted-foreground">
                  Once your request is approved, visit the{" "}
                  <Link to="/view" className="text-primary hover:underline">
                    access page
                  </Link>{" "}
                  and enter your email to download the presentation.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-border"
            >
              <a href="/">
                <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                Go to Home
              </a>
            </Button>
            <Button asChild size="sm" className="glow-teal-sm">
              <Link to="/view">Check Approval Status</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
