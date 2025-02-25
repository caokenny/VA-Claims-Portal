import { LightningElement, track } from 'lwc';
import createClaim from '@salesforce/apex/ClaimController.createClaim';

export default class FileClaim extends LightningElement {
    @track claim = { 
        Claimant__c: '', 
        Date_Of_Injury__c: '', 
        Type__c: '', 
        Disability__c: '', 
        Housing_Status__c: '', 
        Currently_Homeless__c: false, 
        Education_Type__c: '', 
        Has_Attachment__c: false 
    };

    typeOptions = [
        { label: 'Medical', value: 'Medical' },
        { label: 'Property Damage', value: 'Property Damage' },
        { label: 'Other', value: 'Other' }
    ];

    housingOptions = [
        { label: 'Owned', value: 'Owned' },
        { label: 'Rented', value: 'Rented' },
        { label: 'Homeless', value: 'Homeless' }
    ];

    educationOptions = [
        { label: 'High School', value: 'High School' },
        { label: 'Undergraduate', value: 'Undergraduate' },
        { label: 'Graduate', value: 'Graduate' }
    ];

    handleChange(event) {
        this.claim[event.target.name] = event.target.value;
    }

    handleCheckboxChange(event) {
        this.claim[event.target.name] = event.target.checked;
    }

    handleFileUpload(event) {
        this.claim.Has_Attachment__c = true;
    }

    async handleSubmit() {
        try {
            const result = await createClaim({ claimData: this.claim });
            console.log('Claim submitted successfully:', result);
        } catch (error) {
            console.error('Error submitting claim:', error);
        }
    }
}