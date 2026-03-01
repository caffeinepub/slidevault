import Text "mo:core/Text";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  include MixinStorage();
  public type ViewRequestStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type Presentation = {
    id : Text;
    title : Text;
    description : Text;
    file : Storage.ExternalBlob;
    uploadedAt : Time.Time;
    ownerId : Principal;
  };

  public type ViewRequest = {
    id : Text;
    presentationId : Text;
    guestName : Text;
    guestEmail : Text;
    status : ViewRequestStatus;
    requestedAt : Time.Time;
  };

  let viewRequestState = Map.empty<Text, ViewRequest>();
  let presentationState = Map.empty<Text, Presentation>();

  module ViewRequestDao {
    public func get(id : Text) : ?ViewRequest {
      viewRequestState.get(id);
    };

    public func put(id : Text, viewRequest : ViewRequest) {
      viewRequestState.add(id, viewRequest);
    };

    public func delete(id : Text) {
      viewRequestState.remove(id);
    };

    public func getAll() : Iter.Iter<(Text, ViewRequest)> {
      viewRequestState.entries();
    };
  };

  module PresentationDao {
    public func get(id : Text) : ?Presentation {
      presentationState.get(id);
    };

    public func put(id : Text, presentation : Presentation) {
      presentationState.add(id, presentation);
    };

    public func delete(id : Text) {
      presentationState.remove(id);
    };

    public func getAll() : Iter.Iter<(Text, Presentation)> {
      presentationState.entries();
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var idCounter : Nat = 0;

  func generateId() : Text {
    idCounter += 1;
    idCounter.toText();
  };

  public shared ({ caller }) func uploadPresentation(title : Text, description : Text, file : Storage.ExternalBlob) : async Presentation {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Only admins can upload presentations");
    };

    let id = generateId();
    let presentation : Presentation = {
      id;
      title;
      description;
      file;
      uploadedAt = Time.now();
      ownerId = caller;
    };

    PresentationDao.put(id, presentation);
    presentation;
  };

  public query func generateQrCodeUrl(presentationId : Text) : async Text {
    switch (PresentationDao.get(presentationId)) {
      case (null) { Runtime.trap("Presentation not found") };
      case (?_presentation) { "https://icp0.io/p/" # presentationId };
    };
  };

  public shared ({ caller }) func submitViewRequest(presentationId : Text, guestName : Text, guestEmail : Text) : async ViewRequest {
    switch (PresentationDao.get(presentationId)) {
      case (null) { Runtime.trap("Presentation not found") };
      case (?_presentation) {
        let id = generateId();
        let viewRequest : ViewRequest = {
          id;
          presentationId;
          guestName;
          guestEmail;
          status = #pending;
          requestedAt = Time.now();
        };

        ViewRequestDao.put(id, viewRequest);
        viewRequest;
      };
    };
  };

  public shared ({ caller }) func approveRequest(requestId : Text) : async ViewRequest {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Only admins can approve requests");
    };

    switch (ViewRequestDao.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) {
        let updatedRequest = {
          id = request.id;
          presentationId = request.presentationId;
          guestName = request.guestName;
          guestEmail = request.guestEmail;
          status = #approved : ViewRequestStatus;
          requestedAt = request.requestedAt;
        };
        ViewRequestDao.put(requestId, updatedRequest);
        updatedRequest;
      };
    };
  };

  public shared ({ caller }) func rejectRequest(requestId : Text) : async ViewRequest {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Only admins can reject requests");
    };

    switch (ViewRequestDao.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) {
        let updatedRequest = {
          id = request.id;
          presentationId = request.presentationId;
          guestName = request.guestName;
          guestEmail = request.guestEmail;
          status = #rejected : ViewRequestStatus;
          requestedAt = request.requestedAt;
        };
        ViewRequestDao.put(requestId, updatedRequest);
        updatedRequest;
      };
    };
  };

  public shared ({ caller }) func getApprovedPresentation(guestEmail : Text) : async Storage.ExternalBlob {
    let requests = ViewRequestDao.getAll().toList<(Text, ViewRequest)>();

    switch (requests.find(func((id, req)) { req.guestEmail == guestEmail and req.status == #approved })) {
      case (?(_, req)) {
        switch (PresentationDao.get(req.presentationId)) {
          case (null) { Runtime.trap("Presentation not found") };
          case (?presentation) { presentation.file };
        };
      };
      case (null) { Runtime.trap("No approved request found for this email") };
    };
  };

  public query ({ caller }) func getAllRequests() : async [ViewRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all requests");
    };
    ViewRequestDao.getAll().map<(Text, ViewRequest), ViewRequest>(
      func((id, req)) { req }
    ).toArray();
  };

  public query ({ caller }) func getAllPresentations() : async [Presentation] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all presentations");
    };
    PresentationDao.getAll().map<(Text, Presentation), Presentation>(
      func((id, pres)) { pres }
    ).toArray();
  };

  public query ({ caller }) func getPresentation(id : Text) : async Presentation {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view presentations");
    };
    switch (PresentationDao.get(id)) {
      case (null) { Runtime.trap("Presentation not found") };
      case (?presentation) { presentation };
    };
  };

  public query ({ caller }) func getRequest(id : Text) : async ViewRequest {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view requests");
    };
    switch (ViewRequestDao.get(id)) {
      case (null) { Runtime.trap("Request not found") };
      case (?req) { req };
    };
  };
};
