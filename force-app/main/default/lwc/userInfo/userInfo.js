import { LightningElement, track, wire } from "lwc";
import getLoggedInUser from "@salesforce/apex/ClaimantController.getLoggedInUser";
import updateClaimant from "@salesforce/apex/ClaimantController.updateClaimant";

export default class ClaimantDetails extends LightningElement {
  @track claimant;
  error = "";
  errorOnSave = "";
  successMessage = "";
  @track isViewMode = true;
  originalClaimant;
  showDischargeType;

  @wire(getLoggedInUser)
  wiredClaimant({ data, error }) {
    if (data) {
      this.claimant = { ...data }; // Deep copy for editing
      this.originalClaimant = { ...data }; // Store original values
      // console.log("Wire Service Ran");
      if (this.claimant.Veteran_Status__c === "Discharged") {
        this.showDischargeType = true;
      }
      this.error = undefined;
    } else if (error) {
      this.error = error.body.message;
      this.claimant = undefined;
    }
  }

  handleEdit() {
    this.isViewMode = false;
  }

  handleCancel() {
    this.isViewMode = true; // Disable fields again
    this.claimant = { ...this.originalClaimant }; // Restore original values
    this.showDischargeType = this.claimant.Veteran_Status__c === "Discharged";
  }

  handleInputChange(event) {
    const field = event.target.dataset.field;
    if (field) {
      this.claimant[field] = event.target.value; // Update local copy
      if (field === "Veteran_Status__c") {
        this.showDischargeType =
          this.claimant.Veteran_Status__c === "Discharged";
        if (!this.showDischargeType) {
          this.claimant.Discharge_Type__c = null;
        }
      }
    }
  }

  get branches() {
    return [
      { label: "Air Force", value: "Air Force" },
      { label: "Army", value: "Army" },
      { label: "Marine", value: "Marine" },
      { label: "National Guard", value: "National Guard" },
      { label: "Navy", value: "Navy" }
    ];
  }

  get status() {
    return [
      { label: "Active Duty", value: "Active Duty" },
      { label: "Veteran", value: "Veteran" },
      { label: "Retired", value: "Retired" },
      { label: "Discharged", value: "Discharged" }
    ];
  }

  get dischargeOptions() {
    return [
      { label: "Honorable", value: "Honorable" },
      {
        label: "General under Honorable Conditions",
        value: "General under Honorable Conditions"
      },
      { label: "Other than Honorable", value: "Other than Honorable" },
      { label: "Bad Conduct", value: "Bad Conduct" },
      { label: "Dishonorable", value: "Dishonorable" }
    ];
  }

  async handleSave() {
    updateClaimant({ updatedClaimant: this.claimant })
      .then(() => {
        this.successMessage = "Details updated successfully";
        this.errorOnSave = undefined;
        this.isViewMode = true;
        this.originalClaimant = this.claimant;
      })
      .catch((error) => {
        this.errorOnSave = error.body.message;
        this.successMessage = undefined;
      });
  }
}
