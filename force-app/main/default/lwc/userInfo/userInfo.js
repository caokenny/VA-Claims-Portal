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

  @wire(getLoggedInUser)
  wiredClaimant({ data, error }) {
    if (data) {
      this.claimant = { ...data }; // Deep copy for editing
      this.originalClaimant = { ...data }; // Store original values
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
  }

  handleInputChange(event) {
    const field = event.target.dataset.field;
    if (field) {
      this.claimant[field] = event.target.value; // Update local copy
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
