import { LightningElement, wire, track } from "lwc";
import getUserClaims from "@salesforce/apex/ViewClaimController.getUserClaims";
import { NavigationMixin } from "lightning/navigation";

const COLUMNS = [
  {
    label: "Claim ID",
    fieldName: "claimLink",
    type: "url",
    typeAttributes: { label: { fieldName: "Name" }, target: "_self" }
  },
  { label: "Claimant", fieldName: "ClaimantName", type: "text" },
  { label: "Type", fieldName: "Type__c", type: "text" },
  { label: "Status", fieldName: "Status__c", type: "text" },
  { label: "Date of Injury", fieldName: "Date_Of_Injury__c", type: "date" },
  { label: "Education Type", fieldName: "Education_Type__c", type: "text" },
  { label: "Disability", fieldName: "Disability__c", type: "text" },
  { label: "Housing Status", fieldName: "Housing_Status__c", type: "text" }
];

export default class ViewClaims extends NavigationMixin(LightningElement) {
  @track claims;
  columns = COLUMNS;

  @wire(getUserClaims)
  wiredClaims({ error, data }) {
    if (data) {
      this.claims = data.map((record) => ({
        ...record,
        // claimLink: `/lightning/r/Claim__c/${record.Id}/view`,
        claimLink: `/view-claims/view-claims/track-claim?claimId=${record.Name}`,
        ClaimantName: record.Claimant__r
          ? `${record.Claimant__r.First_Name__c} ${record.Claimant__r.Last_Name__c}`
          : "N/A"
      }));
    } else if (error) {
      console.error(error);
      this.claims = undefined;
    }
  }

  // handleRowAction(event) {
  //     const claimId = event.detail.row.Id;
  //     this[NavigationMixin.Navigate]({
  //         type: 'standard__component',
  //         attributes: {
  //             componentName: 'c__trackClaim'
  //         },
  //         state: {
  //             c__claimId: claimId
  //         }
  //     });
  // }
}
