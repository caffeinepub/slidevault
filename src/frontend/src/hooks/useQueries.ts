import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Presentation, ViewRequest } from "../backend";
import type { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

// ─── Presentations ────────────────────────────────────────────────────────────

export function useGetAllPresentations() {
  const { actor, isFetching } = useActor();
  return useQuery<Presentation[]>({
    queryKey: ["presentations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPresentations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPresentation(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Presentation>({
    queryKey: ["presentation", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getPresentation(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useUploadPresentation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      file,
    }: {
      title: string;
      description: string;
      file: ExternalBlob;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.uploadPresentation(title, description, file);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["presentations"] });
    },
  });
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export function useGetAllRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<ViewRequest[]>({
    queryKey: ["requests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitViewRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      presentationId,
      guestName,
      guestEmail,
    }: {
      presentationId: string;
      guestName: string;
      guestEmail: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitViewRequest(presentationId, guestName, guestEmail);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useApproveRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.approveRequest(requestId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useRejectRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.rejectRequest(requestId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

// ─── Admin & Auth ─────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── QR Code ──────────────────────────────────────────────────────────────────

export function useGenerateQrCodeUrl(presentationId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["qrCodeUrl", presentationId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.generateQrCodeUrl(presentationId);
    },
    enabled: !!actor && !isFetching && !!presentationId,
  });
}

// ─── Approved Presentation ────────────────────────────────────────────────────

export function useGetApprovedPresentation() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (guestEmail: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getApprovedPresentation(guestEmail);
    },
  });
}
