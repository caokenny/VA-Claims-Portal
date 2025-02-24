import { LightningElement, wire, api } from "lwc";
import { getFieldValue, getRecord } from "lightning/uiRecordApi";
import FIRSTNAME_FIELD from "@salesforce/schema/Contact.FirstName";
import LASTNAME_FIELD from "@salesforce/schema/Contact.LastName";
import EMAIL_FIELD from "@salesforce/schema/Contact.Email";

const FIELDS = [FIRSTNAME_FIELD, LASTNAME_FIELD, EMAIL_FIELD];

export default class UserInfo extends LightningElement {
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  wiredContact({ error, data }) {
    if (data) {
      this.firstName = getFieldValue(data.data, FIRSTNAME_FIELD);
      this.lastName = getFieldValue(data.data, LASTNAME_FIELD);
      this.email = getFieldValue(data.data, EMAIL_FIELD);
      this.errorMessage = undefined;
    } else if (error) {
      this.errorMessage = "Error loading contact";
    }
  }
}
