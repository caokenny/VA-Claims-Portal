import { LightningElement, track } from 'lwc';
import submitAppeal from '@salesforce/apex/AppealSubmissionController.submitAppeal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AppealForm extends LightningElement {
    @track reason = '';
    @track comments = '';
    @track hasAttachment = false;
    @track appealId; // Stores the newly created appeal ID

    handleChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    }

    handleSubmit() {
        const appealRecord = {
            Reason__c: this.reason,
            Comments__c: this.comments,
            Has_Attachment__c: this.hasAttachment
        };

        submitAppeal({ newAppeal: appealRecord })
            .then((result) => {
                this.appealId = result.Id; // Store appeal ID for file upload
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Appeal Submitted Successfully',
                    variant: 'success'
                }));

                // Reset form
                this.reason = '';
                this.comments = '';
                this.hasAttachment = false;
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
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
