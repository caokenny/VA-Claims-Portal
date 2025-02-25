import { LightningElement, wire, track } from 'lwc';
import getClaims from '@salesforce/apex/ViewClaimController.getUserClaims';

export default class ViewClaims extends LightningElement {
    @track claims;
    @track error;

    @wire(getClaims)
    wiredClaims({ error, data }) {
        if (data) {
            this.claims = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.claims = undefined;
        }
    }
}