import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import USER_ID from '@salesforce/user/Id';
import createContentDocumentLink from '@salesforce/apex/ClaimController.createContentDocumentLink';
import createClaim from '@salesforce/apex/ClaimController.createClaim';
import getOrCreateClaimantForUser from '@salesforce/apex/ClaimController.getOrCreateClaimantForUser';

export default class FileClaim extends LightningElement {
    @track claimTypes = [];
    @track selectedType = '';
    @track showFields = {};
    @track claimantId;
    @track claimRecordId;
    @track pensionEligibilityOptions = [];
    @track preferredCommunicationOptions = []; 
    @track housingStatusOptions = []; 
    uploadedFiles = [];

    claimRecord = {
        Type__c: '',
        Disability__c: '',
        Date_Of_Injury__c: '',
        Annual_Income__c: '',
        Currently_Homeless__c: '',
        Housing_Status__c: '',
        Education_Type__c: '',
        Institution_Name__c: '',
        Claimant__c: '',
        At_risk_of_being_homeless__c: ' ',
        Comments__c: '',
        Current_Insurance_Provider__c: '',
        Current_Medications_or_Allergies__c: '',
        Degree_or_Certification_Program__c: '',
        Expected_Completion_Date__c: '',
        Pension_Eligibility__c: '',
        Preferred_Communication_Method__c: '',
        Preferred_VA_Facility__c: '',
        Service_Connected__c: '',
        Start_Date__c: '',
    };

    claimTypeOptions = [
        { label: 'Disability Compensation', value: 'Disability Compensation' },
        { label: 'Pension', value: 'Pension' },
        { label: 'Healthcare Benefits', value: 'Healthcare Benefits' },
        { label: 'Education & Training', value: 'Education & Training' },
        { label: 'Housing Assistance', value: 'Housing Assistance' }
    ];

    @wire(getOrCreateClaimantForUser, { userId: USER_ID })
    wiredClaimant({ data, error }) {
        if (data) {
            this.claimantId = data;
            this.claimRecord.Claimant__c = data;
        } else if (error) {
            console.error('Error fetching Claimant:', error);
        }
    }

    @track pensionEligibilityOptions = [
        { label: 'Are you 65 or older?', value: '65+' },
        { label: 'Permanently Disabled?', value: 'Permanently Disabled' },
    ];

    @track preferredCommunicationOptions = [
        { label: 'Phone', value: 'Phone' },
        { label: 'Email', value: 'Email' },
        { label: 'Mail', value: 'Mail' }
    ];

    handleCurrentlyHomelessChange(event) {
        const isCurrentlyHomeless = event.target.checked;
    
        if (isCurrentlyHomeless) {
            this.housingStatusOptions = [
                { label: 'Living in a shelter', value: 'Living in a shelter' },
                { label: 'Not currently in a sheltered environment', value: 'Not currently in a sheltered environment' },
                { label: 'Staying with another person', value: 'Staying with another person' },
                { label: 'Fleeing current residence', value: 'Fleeing current residence' },
                { label: 'Other', value: 'Other' }
            ];
        } else {
            this.housingStatusOptions = [
                { label: 'Housing will be lost in 30 days', value: 'Housing will be lost in 30 days' },
                { label: 'Leaving publicly funded system of care', value: 'Leaving publicly funded system of care' },
                { label: 'Other', value: 'Other' }
            ];
        }
    
        this.claimRecord.Currently_Homeless__c = event.target.checked;

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
            institutionName: this.selectedType === 'Education & Training',
            atRiskofBeingHomeless: this.selectedType === 'Housing Assistance',
            comments: ['Healthcare Benefits', 'Housing Assistance', 'Pension', 'Education & Training', 'Disability Compensation'].includes(this.selectedType),
            currentInsuranceProvider: this.selectedType === 'Healthcare Benefits',
            currentMedicationsorAllergies: this.selectedType === 'Healthcare Benefits',
            degreeorCertificationProgram: this.selectedType === 'Education & Training',
            expectedCompletionDate: this.selectedType === 'Education & Training',
            pensionEligibility: this.selectedType === 'Pension',
            preferredCommunicationMethod: ['Healthcare Benefits', 'Housing Assistance', 'Pension', 'Education & Training', 'Disability Compensation'].includes(this.selectedType),
            preferredVAFacility: this.selectedType === 'Housing Assistance',
            serviceConnected: this.selectedType === 'Disability Compensation',
            startDate: this.selectedType === 'Education & Training'
        };
    }

    handleInputChange(event) {
        this.claimRecord[event.target.name] = event.target.value;
    }

    handleFileUpload(event) {
        this.uploadedFiles = event.detail.files.map(file => file.documentId);
    }

    handleSubmit() {
        console.log('Submitting claim...');
        console.log('Selected Claim Type:', this.selectedType);
        console.log('Claimant ID:', this.claimantId);
   
        if (!this.selectedType) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Please select a claim type before submitting.',
                variant: 'error'
            }));
            return;
        }
   
        
        this.claimRecord.Type__c = this.selectedType;
        this.claimRecord.Claimant__c = this.claimantId;
        this.claimRecord.Status__c = 'Received';
   
        const claimRecord = { ...this.claimRecord };
   
        
        if (claimRecord.Date_Of_Injury__c) {
            claimRecord.Date_Of_Injury__c = new Date(claimRecord.Date_Of_Injury__c);
        }
        if (claimRecord.Start_Date__c) {
            claimRecord.Start_Date__c = new Date(claimRecord.Start_Date__c);
        }
   
        createClaim({ newClaim: claimRecord })
            .then(result => {
                this.claimRecordId = result;
                console.log('Claim created successfully:', this.claimRecordId);
   
                if (this.uploadedFiles.length > 0) {
                    this.uploadedFiles.forEach(fileId => {
                        this.linkFileToClaim(fileId, this.claimRecordId);
                    });
                }
   
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
   

    getRecordTypeId(recordTypeName) {
       
        return getRecordTypeId({ recordTypeName: recordTypeName })
            .then(result => {
                return result;
            })
            .catch(error => {
                console.error('Error fetching RecordTypeId:', error);
                return null;
            });
    }

    linkFileToClaim(fileId, claimId) {
        createContentDocumentLink({ contentDocumentId: fileId, relatedRecordId: claimId })
            .then(() => {
                console.log('File linked to Claim successfully');
            })
            .catch(error => {
                console.error('Error linking file:', error);
            });
    }
}
