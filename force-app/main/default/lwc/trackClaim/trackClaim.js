import { LightningElement, wire } from "lwc";
import getClaim from "@salesforce/apex/TrackClaimController.getClaim";

export default class TrackClaim extends LightningElement {
  claimId;
  claim;
  error;
  showFields = {};
  currentStep = "Received";

  connectedCallback() {
    const params = new URLSearchParams(window.location.search);
    this.claimId = params.get("claimId");
  }

  @wire(getClaim, { claimId: "$claimId" })
  wiredClaim({ error, data }) {
    if (data) {
      this.claim = data;
      this.updateFieldVisibility();
      this.setCurrentStep();
    } else if (error) {
      this.error = "Error retrieving claim details";
    }
  }

  updateFieldVisibility() {
    this.showFields = {
      disability: [
        "Healthcare Benefits",
        "Pension",
        "Disability Compensation"
      ].includes(this.claim.Type__c),
      dateOfInjury: [
        "Healthcare Benefits",
        "Pension",
        "Disability Compensation"
      ].includes(this.claim.Type__c),
      annualIncome: [
        "Healthcare Benefits",
        "Housing Assistance",
        "Pension",
        "Education & Training",
        "Disability Compensation"
      ].includes(this.claim.Type__c),
      currentlyHomeless: this.claim.Type__c === "Housing Assistance",
      housingStatus: this.claim.Type__c === "Housing Assistance",
      educationType: this.claim.Type__c === "Education & Training",
      institutionName: this.claim.Type__c === "Education & Training"
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
  }
}
