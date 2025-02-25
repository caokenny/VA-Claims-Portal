import { LightningElement, track, wire } from 'lwc';
import getRecordTypes from '@salesforce/apex/ClaimController.getRecordTypes';
import getFieldsForRecordType from '@salesforce/apex/ClaimController.getFieldsForRecordType';
import createClaim from '@salesforce/apex/ClaimController.createClaim';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateClaimLWC extends LightningElement {
    @track recordTypeOptions = [];
    @track selectedRecordType = '';
    @track fieldsToShow = [];
    @track claimRecord = {};
    @track uploadedFiles = [];
    isLoading = false;

    // Fetch record types from Apex
    @wire(getRecordTypes)
    wiredRecordTypes({ error, data }) {
        if (data) {
            this.recordTypeOptions = data.map(rt => ({ label: rt.Name, value: rt.Id }));
        } else if (error) {
            console.error('Error fetching record types:', error);
        }
    }

    // Handle Record Type Selection
    handleRecordTypeChange(event) {
        this.selectedRecordType = event.detail.value;
        this.claimRecord = {}; // Reset fields when changing record type

        getFieldsForRecordType({ recordTypeId: this.selectedRecordType })
            .then(data => {
                this.fieldsToShow = data.map(field => ({
                    apiName: field.apiName,
                    label: field.label,
                    type: field.type.toLowerCase() // Ensure correct input type handling
                }));
            })
            .catch(error => console.error('Error fetching fields', error));
    }

    // Handle Input Changes
    handleFieldChange(event) {
        const fieldName = event.target.name;
        this.claimRecord[fieldName] = event.target.value;
    }

    // Handle File Upload
    handleFileUpload(event) {
        this.uploadedFiles = event.detail.files.map(file => file.documentId);
    }

    // Submit Claim
    handleSubmit() {
        if (!this.selectedRecordType) {
            this.showToast('Error', 'Please select a Record Type.', 'error');
            return;
        }

        this.isLoading = true;
        const fields = { ...this.claimRecord, RecordTypeId: this.selectedRecordType, files: this.uploadedFiles };

        createClaim({ claimData: fields })
            .then(() => {
                this.showToast('Success', 'Claim Created Successfully', 'success');
                this.claimRecord = {};
                this.selectedRecordType = '';
                this.uploadedFiles = [];
            })
            .catch(error => {
                this.showToast('Error', 'Error creating claim: ' + JSON.stringify(error), 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
