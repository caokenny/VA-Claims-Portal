import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import getClaimTypes from '@salesforce/apex/ClaimController.getClaimTypes';
import createClaim from '@salesforce/apex/ClaimController.createClaim';

export default class FileClaim extends LightningElement {
    @track claimTypes = [];
    @track selectedType = '';
    @track showFields = {};
    @track claimantId;

    claimRecord = {
        Claim_Type__c: '',
        Disability__c: '',
        Date_Of_Injury__c: '',
        Annual_Income__c: '',
        Currently_Homeless__c: '',
        Housing_Status__c: '',
        Education_Type__c: '',
        Institution_Name__c: ''
    };

    // Get logged-in user details
    @wire(getRecord, { recordId: USER_ID, fields: ['User.ContactId'] })
    wiredUser({ data, error }) {
        if (data) {
            this.claimantId = data.fields.ContactId.value;
        } else if (error) {
            console.error('Error fetching user data:', error);
        }
    }

    // Fetch claim types
    @wire(getClaimTypes)
    wiredTypes({ data, error }) {
        if (data) {
            this.claimTypes = data.map(type => ({ label: type, value: type }));
        } else if (error) {
            console.error(error);
        }
    }

    handleTypeChange(event) {
        this.selectedType = event.detail.value;
        this.updateFieldsVisibility();
    }

    updateFieldsVisibility() {
        this.showFields = {
            disability: ['Healthcare', 'Pension', 'Disability'].includes(this.selectedType),
            dateOfInjury: ['Healthcare', 'Pension', 'Disability'].includes(this.selectedType),
            annualIncome: ['Healthcare', 'Housing', 'Pension', 'Education', 'Disability'].includes(this.selectedType),
            currentlyHomeless: this.selectedType === 'Housing',
            housingStatus: this.selectedType === 'Housing',
            educationType: this.selectedType === 'Education',
            institutionName: this.selectedType === 'Education'
        };
    }

    handleInputChange(event) {
        this.claimRecord[event.target.name] = event.target.value;
    }

    handleSubmit() {
        this.claimRecord.Claim_Type__c = this.selectedType;

        createClaim({ newClaim: this.claimRecord })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Claim filed successfully!',
                    variant: 'success'
                }));
            })
            .catch(error => {
                console.error(error);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: 'Failed to file claim',
                    variant: 'error'
                }));
            });
    }
}
