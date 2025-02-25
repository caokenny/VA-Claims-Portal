import { LightningElement } from "lwc";
import registerUser from "@salesforce/apex/RegistrationController.registerUser";

export default class RegistrationForm extends LightningElement {
  firstName = "";
  lastName = "";
  email = "";
  dateOfBirth = "";
  phone = "";
  militaryBranch = "";
  veteranStatus = "";
  dischargeType = "";
  errorMessage = "";
  password = "";
  showDischargeType = false;

  handleInputChange(event) {
    const field = event.target.dataset.id;
    this[field] = event.target.value;
    // console.log(`Field: ${field}, Value: ${this[field]}`);

    if (field === "veteranStatus") {
      this.showDischargeType = this.veteranStatus === "Discharged";
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

  async handleRegister() {
    try {
      const result = await registerUser({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        dateOfBirth: this.dateOfBirth,
        phone: this.phone,
        militaryBranch: this.militaryBranch,
        veteranStatus: this.veteranStatus,
        dischargeType: this.dischargeType
      });
      if (result === "/login") {
        this.errorMessage = "User registered successfully!";
        window.location.href = result;
      } else {
        this.errorMessage = result;
      }
    } catch (error) {
      this.errorMessage =
        error.body.message || "An error occurred during registration.";
    }
  }
}
