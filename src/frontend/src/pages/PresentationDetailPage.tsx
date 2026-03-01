import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Download,
  Presentation as FilePresentation,
  Loader2,
  QrCode,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ViewRequestStatus } from "../backend";
import { QRCodeDisplay } from "../components/QRCodeDisplay";
import { StatusBadge } from "../components/StatusBadge";
import {
  useApproveRequest,
  useGetAllRequests,
  useGetPresentation,
  useRejectRequest,
} from "../hooks/useQueries";
import { formatDate, formatDateTime } from "../utils/formatDate";

export function PresentationDetailPage() {
  const { id } = useParams({ from: "/presentation/$id" });
  const [copied, setCopied] = useState(false);

  const {
    data: presentation,
    isLoading: presLoading,
    error: presError,
  } = useGetPresentation(id);
  const { data: allRequests, isLoading: requestsLoading } = useGetAllRequests();
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();

  const requests = allRequests?.filter((r) => r.presentationId === id) ?? [];
  const pendingRequests = requests.filter(
    (r) => r.status === ViewRequestStatus.pending,
  );
  const approvedRequests = requests.filter(
    (r) => r.status === ViewRequestStatus.approved,
  );
  const rejectedRequests = requests.filter(
    (r) => r.status === ViewRequestStatus.rejected,
  );

  const publicRequestUrl = `${window.location.origin}/request/${id}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(publicRequestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard");
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequest.mutateAsync(requestId);
      toast.success("Request approved");
    } catch {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest.mutateAsync(requestId);
      toast.success("Request rejected");
    } catch {
      toast.error("Failed to reject request");
    }
  };

  const filterRequests = (tab: string) => {
    switch (tab) {
      case "pending":
        return pendingRequests;
      case "approved":
        return approvedRequests;
      case "rejected":
        return rejectedRequests;
      default:
        return requests;
    }
  };

  if (presError) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center animate-fade-in">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <h2 className="font-display text-xl font-semibold">
          Presentation not found
        </h2>
        <p className="text-muted-foreground text-sm mt-1 mb-4">
          This presentation may have been removed.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          {presLoading ? (
            <Skeleton className="h-7 w-48" />
          ) : (
            <h1 className="font-display text-2xl font-bold text-foreground truncate">
              {presentation?.title}
            </h1>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: details + QR */}
        <div className="lg:col-span-1 space-y-4">
          {/* Presentation info */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {presLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ) : presentation ? (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                      <FilePresentation className="h-3 w-3" />
                      Description
                    </p>
                    <p className="text-sm text-foreground/80">
                      {presentation.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Uploaded
                    </p>
                    <p className="text-sm text-foreground/80">
                      {formatDate(presentation.uploadedAt)}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-primary/30 text-primary hover:bg-primary/10"
                    size="sm"
                  >
                    <a
                      href={presentation.file.getDirectURL()}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Download className="h-3.5 w-3.5 mr-2" />
                      Download File
                    </a>
                  </Button>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* QR Code card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                Share QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Share this QR code so guests can request access to the
                presentation.
              </p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg overflow-hidden"
              >
                <QRCodeDisplay url={publicRequestUrl} size={180} />
              </motion.div>

              <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground flex-1 truncate font-mono">
                  {publicRequestUrl}
                </p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Or share the link directly ↑
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: requests table */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-base">
                  Access Requests
                </CardTitle>
                {pendingRequests.length > 0 && (
                  <Badge className="bg-warning/15 text-warning border-warning/30">
                    {pendingRequests.length} pending
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all">
                <div className="px-4 pb-2">
                  <TabsList className="bg-muted/50 h-8">
                    <TabsTrigger value="all" className="text-xs">
                      All ({requests.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs">
                      Pending ({pendingRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="text-xs">
                      Approved ({approvedRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="text-xs">
                      Rejected ({rejectedRequests.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                {["all", "pending", "approved", "rejected"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-0">
                    <PresentationRequestsTable
                      requests={filterRequests(tab)}
                      isLoading={requestsLoading}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      isApproving={approveRequest.isPending}
                      isRejecting={rejectRequest.isPending}
                      pendingId={
                        approveRequest.variables ??
                        rejectRequest.variables ??
                        null
                      }
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface PresentationRequestsTableProps {
  requests: import("../backend").ViewRequest[];
  isLoading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
  pendingId: string | null;
}

function PresentationRequestsTable({
  requests,
  isLoading,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
  pendingId,
}: PresentationRequestsTableProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center gap-2 text-muted-foreground">
        <AlertCircle className="h-7 w-7 opacity-30" />
        <p className="text-sm">No requests in this category</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground text-xs">
              Guest
            </TableHead>
            <TableHead className="text-muted-foreground text-xs hidden sm:table-cell">
              Requested
            </TableHead>
            <TableHead className="text-muted-foreground text-xs">
              Status
            </TableHead>
            <TableHead className="text-muted-foreground text-xs text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id} className="border-border">
              <TableCell>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {req.guestName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {req.guestEmail}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                {formatDateTime(req.requestedAt)}
              </TableCell>
              <TableCell>
                <StatusBadge status={req.status} />
              </TableCell>
              <TableCell className="text-right">
                {req.status === ViewRequestStatus.pending && (
                  <div className="flex items-center gap-1.5 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-success/30 text-success hover:bg-success/10"
                      onClick={() => onApprove(req.id)}
                      disabled={
                        (isApproving || isRejecting) && pendingId === req.id
                      }
                    >
                      {isApproving && pendingId === req.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Approve"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => onReject(req.id)}
                      disabled={
                        (isApproving || isRejecting) && pendingId === req.id
                      }
                    >
                      {isRejecting && pendingId === req.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Reject"
                      )}
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
