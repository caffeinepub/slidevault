import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ViewRequest {
    id: string;
    status: ViewRequestStatus;
    presentationId: string;
    guestName: string;
    guestEmail: string;
    requestedAt: Time;
}
export type Time = bigint;
export interface Presentation {
    id: string;
    title: string;
    ownerId: Principal;
    file: ExternalBlob;
    description: string;
    uploadedAt: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum ViewRequestStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    approveRequest(requestId: string): Promise<ViewRequest>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    generateQrCodeUrl(presentationId: string): Promise<string>;
    getAllPresentations(): Promise<Array<Presentation>>;
    getAllRequests(): Promise<Array<ViewRequest>>;
    getApprovedPresentation(guestEmail: string): Promise<ExternalBlob>;
    getCallerUserRole(): Promise<UserRole>;
    getPresentation(id: string): Promise<Presentation>;
    getRequest(id: string): Promise<ViewRequest>;
    isCallerAdmin(): Promise<boolean>;
    rejectRequest(requestId: string): Promise<ViewRequest>;
    submitViewRequest(presentationId: string, guestName: string, guestEmail: string): Promise<ViewRequest>;
    uploadPresentation(title: string, description: string, file: ExternalBlob): Promise<Presentation>;
}
