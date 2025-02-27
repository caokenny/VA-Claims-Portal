import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import USER_ID from '@salesforce/user/Id';
import getClaimTypes from '@salesforce/apex/ClaimController.getClaimTypes';
import createClaim from '@salesforce/apex/ClaimController.createClaim';
import getOrCreateClaimantForUser from '@salesforce/apex/ClaimController.getOrCreateClaimantForUser';

export default class FileClaim extends LightningElement {
    @track claimTypes = [];
    @track selectedType = '';
    @track showFields = {};
    @track claimantId;

    claimRecord = {
        Type__c: '',
        Disability__c: '',
        Date_Of_Injury__c: '',
        Annual_Income__c: '',
        Currently_Homeless__c: '',
        Housing_Status__c: '',
        Education_Type__c: '',
        Institution_Name__c: '',
        Claimant__c: ''
    };

    // Map API values correctly
    claimTypeOptions = [
        { label: 'Disability Compensation', value: 'Disability Compensation' },
        { label: 'Pension', value: 'Pension' },
        { label: 'Healthcare Benefits', value: 'Healthcare Benefits' },
        { label: 'Education & Training', value: 'Education & Training' },
        { label: 'Housing Assistance', value: 'Housing Assistance' }
    ];

    // Get or create Claimant record for logged-in user
    @wire(getOrCreateClaimantForUser, { userId: USER_ID })
    wiredClaimant({ data, error }) {
        if (data) {
            this.claimantId = data;
            this.claimRecord.Claimant__c = data;
        } else if (error) {
            console.error('Error fetching Claimant:', error);
        }
    }

    handleTypeChange(event) {
        this.selectedType = event.detail.value;
        this.claimRecord.Type__c = this.selectedType;
        this.updateFieldsVisibility();
    }

    updateFieldsVisibility() {
        this.showFields = {
            disability: ['Healthcare Benefits', 'Pension', 'Disability Compensation'].includes(this.selectedType),
            dateOfInjury: ['Healthcare Benefits', 'Pension', 'Disability Compensation'].includes(this.selectedType),
            annualIncome: ['Healthcare Benefits', 'Housing Assistance', 'Pension', 'Education & Training', 'Disability Compensation'].includes(this.selectedType),
            currentlyHomeless: this.selectedType === 'Housing Assistance',
            housingStatus: this.selectedType === 'Housing Assistance',
            educationType: this.selectedType === 'Education & Training',
            institutionName: this.selectedType === 'Education & Training'
        };
    }

    handleInputChange(event) {
        this.claimRecord[event.target.name] = event.target.value;
    }

    handleSubmit() {
        console.log('Submitting claim...');
        console.log('Selected Claim Type:', this.selectedType);
        console.log('Claimant ID:', this.claimantId);

        if (!this.selectedType) {
            console.error('Error: Claim Type is missing.');
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Please select a claim type before submitting.',
                variant: 'error'
            }));
            return;
        }

        const claimRecord = {
            Type__c: this.selectedType,  // Use the correct API name
            Claimant__c: this.claimantId,
            Status__c: 'Received'  // Auto-set status
        };

        createClaim({ newClaim: claimRecord })
            .then(result => {
                console.log('Claim created successfully:', result);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Claim filed successfully!',
                    variant: 'success'
                }));
            })
            .catch(error => {
                console.error('Error creating claim:', error);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: 'Failed to file claim. Please try again.',
                    variant: 'error'
                }));
            });
    }
}
