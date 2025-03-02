import { LightningElement, track, wire } from 'lwc';
import getDeniedClaims from '@salesforce/apex/AppealSubmissionController.getDeniedClaims';
import getReasonPicklistValues from '@salesforce/apex/AppealSubmissionController.getReasonPicklistValues';
import submitAppeal from '@salesforce/apex/AppealSubmissionController.submitAppeal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AppealForm extends LightningElement {
    @track claimOptions = [];
    @track reasonOptions = [];
    @track selectedClaim = '';
    @track selectedReason = '';
    @track comments = '';
    @track hasAttachment = false;
    @track appealId;

    @wire(getDeniedClaims)
    wiredClaims({ error, data }) {
        if (data) {
            this.claimOptions = data.map(claim => ({
                label: claim.Name,   // Display the claim Name field
                value: claim.Id
            }));
        } else if (error) {
            this.showToast('Error', 'Failed to load denied claims', 'error');
        }
    }

    @wire(getReasonPicklistValues)
    wiredReasons({ error, data }) {
        if (data) {
            this.reasonOptions = data.map(reason => ({
                label: reason,
                value: reason
            }));
        } else if (error) {
            this.showToast('Error', 'Failed to load reason options', 'error');
        }
    }

    handleChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    }

    handleSubmit() {
        if (!this.selectedClaim || !this.selectedReason) {
            this.showToast('Error', 'Please select a claim and reason.', 'error');
            return;
        }

        const appealRecord = {
            Claim__c: this.selectedClaim,
            Reason__c: this.selectedReason,
            Comments__c: this.comments,
            Has_Attachment__c: this.hasAttachment,
            Status__c: 'Received',
            Type__c: 'Supplemental Claims'
        };

        submitAppeal({ newAppeal: appealRecord })
            .then((result) => {
                this.appealId = result.Id;
                this.showToast('Success', 'Appeal Submitted Successfully', 'success');

                this.selectedClaim = '';
                this.selectedReason = '';
                this.comments = '';
                this.hasAttachment = false;
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    handleFileUpload(event) {
        const uploadedFiles = event.detail.files;
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: uploadedFiles.length + ' file(s) uploaded successfully.',
            variant: 'success'
        }));
    }
}
