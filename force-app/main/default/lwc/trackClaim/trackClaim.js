import { LightningElement, wire, api, track } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import getClaim from "@salesforce/apex/TrackClaimController.getClaim";
import getAttachments from "@salesforce/apex/TrackClaimController.getAttachments";

export default class TrackClaim extends LightningElement {
  @api claimId;
  @track internalClaimId;
  claim;
  error;
  showFields = {};
  currentStep = "Received";
  files = [];

  @wire(CurrentPageReference)
  getStateParameters(currentPageReference) {
    console.log("currentPageReference", currentPageReference);
    if (currentPageReference && currentPageReference.state.claimId) {
      this.internalClaimId = currentPageReference.state.claimId;
    } else {
      const params = new URLSearchParams(window.location.search);
      this.internalClaimId = params.get("claimId");
    }
  }

  steps = [
    { label: "Received", value: "Received", class: "step" },
    { label: "Under Review", value: "Under Review", class: "step" },
    { label: "Evidence Gathering", value: "Evidence Gathering", class: "step" },
    { label: "Decision Pending", value: "Decision Pending", class: "step" },
    { label: "Decision Made", value: "Decision Made", class: "step" }
  ];

  // connectedCallback() {
  //   const params = new URLSearchParams(window.location.search);
  //   this.claimId = params.get("claimId");
  // }

  @wire(getClaim, { claimId: "$internalClaimId" })
  wiredClaim({ error, data }) {
    if (data) {
      this.claim = data;
      this.updateFieldVisibility();
      this.setCurrentStep();
    } else if (error) {
      this.error = "Error retrieving claim details";
    }
  }

  @wire(getAttachments, { recordId: "$claim.Id" })
  wiredFiles({ data }) {
    if (data) {
      this.files = data.map((file) => ({
        title: `${file.title}.${file.fileType}`,
        fileUrl: `${file.fileUrl}`
      }));
    }
  }

  updateFieldVisibility() {
    this.showFields = {
      annualIncome: [
        "Healthcare Benefits",
        "Housing Assistance",
        "Pension",
        "Education & Training",
        "Disability Compensation"
      ].includes(this.claim.Type__c),
      housingStatus: this.claim.Type__c === "Housing Assistance"
    };
  }

  setCurrentStep() {
    const statusMap = {
      Received: "Received",
      "Under Review": "Under Review",
      "Evidence Gathering": "Evidence Gathering",
      "Decision Pending": "Decision Pending",
      "Decision Made": "Decision Made"
    };

    this.currentStep = statusMap[this.claim.Status__c] || "Received";

    // Update step classes dynamically
    this.steps = this.steps.map((step) => ({
      ...step,
      class:
        step.value === this.currentStep
          ? "step active-step"
          : "step disabled-step"
    }));
  }
}
