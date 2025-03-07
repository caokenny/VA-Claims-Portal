import { LightningElement, wire, track } from "lwc";
import getUserClaims from "@salesforce/apex/ViewClaimController.getUserClaims";
import { NavigationMixin } from "lightning/navigation";

const COLUMNS = [
  // {
  //   label: "Claim ID",
  //   fieldName: "claimLink",
  //   type: "url",
  //   typeAttributes: { label: { fieldName: "Name" }, target: "_self" }
  // },
  {
    type: "button",
    initialWidth: 130,
    typeAttributes: {
      label: "View Claim",
      name: "view_claim",
      variant: "brand"
    }
  },
  { label: "First Name", fieldName: "Claimant__r.First_Name__c", type: "text" },
  { label: "Last Name", fieldName: "Claimant__r.Last_Name__c", type: "text" },
  { label: "Type", fieldName: "Type__c", type: "text" },
  { label: "Status", fieldName: "Status__c", type: "text" },
  { label: "Communication", fieldName: "Preferred_Communication_Method__c", type: "date" },
  { label: "Comments", fieldName: "Comments__c", type: "text" },
  {
    label: "Download PDF",
    fieldName: "pdfLink",
    type: "url",
    typeAttributes: { label: "Download", target: "_blank" }
  }
];

export default class ViewClaims extends NavigationMixin(LightningElement) {
  @track claims;
  columns = COLUMNS;

  @wire(getUserClaims)
  wiredClaims({ error, data }) {
    if (data) {
      this.claims = data.map((record) => ({
        ...record,
        pdfLink: `/apex/ClaimPDF?id=${record.Id}`, 
        ClaimantName: record.Claimant__r
          ? `${record.Claimant__r.First_Name__c} ${record.Claimant__r.Last_Name__c}`
          : "N/A"
      }));
    } else if (error) {
      console.error(error);
      this.claims = undefined;
    }
  }

  handleRowAction(event) {
    const claimId = event.detail.row.Id;
    const trackClaimPageUrl = `/s/view-claims/view-claims/track-claim?claimId=${claimId}`;

    window.open(trackClaimPageUrl, "_blank");
    // this[NavigationMixin.Navigate]({
    //     type: 'standard__component',
    //     attributes: {
    //         componentName: 'c__TrackClaim'
    //     },
    //     state: {
    //         c__claimId: claimId
    //     }
    // });
  }
}
