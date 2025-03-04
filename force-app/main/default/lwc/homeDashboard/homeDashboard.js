import { LightningElement, wire, track } from "lwc";
import getMostRecentClaim from "@salesforce/apex/ViewClaimController.getMostRecentClaim";
import getClaimStatistics from '@salesforce/apex/ViewClaimController.getClaimStatistics';
// import { NavigationMixin } from 'lightning/navigation';

export default class HomeDashboard extends LightningElement {
    @track recentClaim;
    @track totalClaims;
    @track approvedClaims;
    @track pendingClaims;
    @track deniedClaims;
    claimStats = {};
    error;

    @wire(getMostRecentClaim)
    wiredRecentClaim({ error, data }) {
        if (data) {
            this.recentClaim = {
                ...data,
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
            console.log('Claim Statistics:', data);
            this.claimStats = data;
        } else if (error) {
            console.error('Error fetching claim statistics', error);
        }
    }

    // Class for dynamic status coloring
    get statusClass() {
        const status = this.recentClaim?.Status__c;
        return status === 'Approved' ? 'slds-text-color_success' :
               status === 'Denied' ? 'slds-text-color_error' :
               status === 'Pending' ? 'slds-text-color_warning' :
               'slds-text-color_default';
    }

    // handleFileClaim() {
    //     this[NavigationMixin.Navigate]({
    //         type: 'standard__webPage',
    //         attributes: {
    //             url: '/s/file-claim' 
    //         }
    //     });
    //     console.log("Redirecting to file claim...");
    // }

    // handleAppealClaim() {
    //     this[NavigationMixin.Navigate]({
    //         type: 'standard__webPage',
    //         attributes: {
    //             url: '/s/appeal-submission' 
    //         }
    //     });
    //     console.log("Redirecting to appeal claim...");
    // }

    // handleTrackClaims() {
    //     this[NavigationMixin.Navigate]({
    //         type: 'standard__webPage',
    //         attributes: {
    //             url: '/s/view-claims' 
    //         }
    //     });
    //     console.log("Redirecting to track claims...");
    // }
}
