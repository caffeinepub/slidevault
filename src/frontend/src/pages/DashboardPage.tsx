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
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Presentation as FilePresentation,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ViewRequestStatus } from "../backend";
import { StatusBadge } from "../components/StatusBadge";
import {
  useApproveRequest,
  useGetAllPresentations,
  useGetAllRequests,
  useRejectRequest,
} from "../hooks/useQueries";
import { formatDate } from "../utils/formatDate";

export function DashboardPage() {
  const { data: presentations, isLoading: presentationsLoading } =
    useGetAllPresentations();
  const { data: requests, isLoading: requestsLoading } = useGetAllRequests();
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();

  const totalPresentations = presentations?.length ?? 0;
  const pendingRequests =
    requests?.filter((r) => r.status === ViewRequestStatus.pending) ?? [];
  const approvedRequests =
    requests?.filter((r) => r.status === ViewRequestStatus.approved) ?? [];
  const rejectedRequests =
    requests?.filter((r) => r.status === ViewRequestStatus.rejected) ?? [];

  const stats = [
    {
      label: "Presentations",
      value: totalPresentations,
      icon: FilePresentation,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending",
      value: pendingRequests.length,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Approved",
      value: approvedRequests.length,
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Rejected",
      value: rejectedRequests.length,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequest.mutateAsync(requestId);
      toast.success("Request approved successfully");
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

  const getPresentationTitle = (presentationId: string) => {
    return (
      presentations?.find((p) => p.id === presentationId)?.title ?? "Unknown"
    );
  };

  const getPendingCount = (presentationId: string) => {
    return (
      requests?.filter(
        (r) =>
          r.presentationId === presentationId &&
          r.status === ViewRequestStatus.pending,
      ).length ?? 0
    );
  };

  const filterRequests = (tab: string) => {
    if (!requests) return [];
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your presentations and access requests
          </p>
        </div>
        <Button asChild className="glow-teal-sm">
          <Link to="/upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload PPT
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon
                        className={`h-4.5 w-4.5 ${stat.color}`}
                        style={{ height: "1.125rem", width: "1.125rem" }}
                      />
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold text-foreground">
                        {presentationsLoading || requestsLoading ? (
                          <Skeleton className="h-7 w-8" />
                        ) : (
                          stat.value
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Presentations list */}
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">
          Your Presentations
        </h2>

        {presentationsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : !presentations || presentations.length === 0 ? (
          <Card className="border-dashed border-border">
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <FilePresentation className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">
                No presentations yet.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/upload">Upload your first presentation</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {presentations.map((pres, i) => {
              const pending = getPendingCount(pres.id);
              return (
                <motion.div
                  key={pres.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-border bg-card hover:border-primary/30 transition-colors duration-150">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FilePresentation className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground truncate">
                            {pres.title}
                          </h3>
                          {pending > 0 && (
                            <Badge className="bg-warning/15 text-warning border-warning/30 text-xs">
                              {pending} pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Uploaded {formatDate(pres.uploadedAt)}
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                      >
                        <Link to="/presentation/$id" params={{ id: pres.id }}>
                          Manage
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Requests */}
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">
          All Access Requests
        </h2>

        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <Tabs defaultValue="all">
              <div className="px-4 pt-4">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="all">
                    All
                    {requests && (
                      <span className="ml-1.5 text-xs opacity-60">
                        ({requests.length})
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending
                    {pendingRequests.length > 0 && (
                      <span className="ml-1.5 text-xs text-warning">
                        ({pendingRequests.length})
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </div>

              {["all", "pending", "approved", "rejected"].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-0">
                  <RequestsTable
                    requests={filterRequests(tab)}
                    isLoading={requestsLoading}
                    getPresentationTitle={getPresentationTitle}
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
  );
}

interface RequestsTableProps {
  requests: ReturnType<typeof useGetAllRequests>["data"] extends
    | (infer T)[]
    | undefined
    ? T[]
    : never[];
  isLoading: boolean;
  getPresentationTitle: (id: string) => string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
  pendingId: string | null;
}

function RequestsTable({
  requests,
  isLoading,
  getPresentationTitle,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
  pendingId,
}: RequestsTableProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center gap-2 text-muted-foreground">
        <AlertCircle className="h-8 w-8 opacity-30" />
        <p className="text-sm">No requests found</p>
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
            <TableHead className="text-muted-foreground text-xs hidden md:table-cell">
              Presentation
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
              <TableCell className="text-sm text-foreground/80 hidden md:table-cell">
                {getPresentationTitle(req.presentationId)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                {formatDate(req.requestedAt)}
              </TableCell>
              <TableCell>
                <StatusBadge status={req.status} />
              </TableCell>
              <TableCell className="text-right">
                {req.status === ViewRequestStatus.pending && (
                  <div className="flex items-center gap-2 justify-end">
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
