import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import registerUser from "@salesforce/apex/RegistrationController.registerUser";

export default class RegistrationForm extends NavigationMixin(
  LightningElement
) {
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
  ssn = "";
  showDischargeType = false;

  handleInputChange(event) {
    const field = event.target.dataset.id;
    this[field] = event.target.value;

    if (field === "veteranStatus") {
      this.showDischargeType = this.veteranStatus === "Discharged";
    }
  }

  handleSSNChange(event) {
    let ssn = event.target.value;

    ssn = ssn.replace(/[^0-9]/g, "");

    if (ssn.length >= 3) {
      ssn = ssn.substring(0, 3) + "-" + ssn.substring(3);
    }

    if (ssn.length >= 6) {
      ssn = ssn.substring(0, 6) + "-" + ssn.substring(6);
    }

    this.ssn = ssn;
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
        ssn: this.ssn,
        dateOfBirth: this.dateOfBirth,
        phone: this.phone,
        militaryBranch: this.militaryBranch,
        veteranStatus: this.veteranStatus,
        dischargeType: this.dischargeType
      });
      if (result.success) {
        this.errorMessage = result.message;
        console.log("Sucess: " + this.errorMessage);
        console.log("Redirect: " + result.redirect);
        this[NavigationMixin.Navigate]({
          type: "standard__webPage",
          attributes: {
            url: result.redirect
          }
        });
      } else {
        this.errorMessage = result.message;
      }
    } catch (error) {
      this.errorMessage =
        error.body.message || "An error occurred during registration.";
    }
  }
}
