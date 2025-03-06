import { LightningElement, wire, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getMostRecentClaim from "@salesforce/apex/ViewClaimController.getMostRecentClaim";
import getClaimStatistics from "@salesforce/apex/ViewClaimController.getClaimStatistics";
import getAttachments from "@salesforce/apex/TrackClaimController.getAttachments";
import userId from "@salesforce/user/Id";

export default class HomeDashboard extends NavigationMixin(LightningElement) {
  @track recentClaim;
  @track totalClaims = 0;
  @track approvedClaims = 0;
  @track pendingClaims = 0;
  @track deniedClaims = 0;
  error;
  showFields = {};
  currentStep = "Received";
  files = [];
  isLoggedIn = userId !== null && userId !== undefined;

  @wire(getMostRecentClaim)
  wiredRecentClaim({ error, data }) {
    if (data) {
      console.log("Most Recent Claim Data: " + data.Id);
      this.recentClaim = {
        ...data,
        Id: data.Id,
        ClaimantName: data.Claimant__r
          ? `${data.Claimant__r.First_Name__c} ${data.Claimant__r.Last_Name__c}`
          : "N/A"
      };
      this.error = undefined;
    } else if (error) {
      this.error = "Unable to load most recent claim.";
      this.recentClaim = undefined;
    }
  }

  @wire(getClaimStatistics)
  wiredClaimStats({ data, error }) {
    if (data) {
      this.totalClaims = data.totalClaims || 0;
      this.approvedClaims = data.approvedClaims || 0;
      this.pendingClaims = data.pendingClaims || 0;
      this.deniedClaims = data.deniedClaims || 0;
    } else if (error) {
      console.error("Error fetching claim statistics", error);
    }
  }

  handleGetStarted() {
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url: "/s/login/SelfRegister"
      }
    });
  }

  // Class for dynamic status coloring
  get statusClass() {
    const status = this.recentClaim?.Status__c;
    return status === "Approved"
      ? "slds-text-color_success"
      : status === "Denied"
        ? "slds-text-color_error"
        : status === "Pending"
          ? "slds-text-color_warning"
          : "slds-text-color_default";
  }

  steps = [
    { label: "Received", value: "Received", class: "step" },
    { label: "Under Review", value: "Under Review", class: "step" },
    { label: "Evidence Gathering", value: "Evidence Gathering", class: "step" },
    { label: "Decision Pending", value: "Decision Pending", class: "step" },
    { label: "Decision Made", value: "Decision Made", class: "step" }
  ];

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
