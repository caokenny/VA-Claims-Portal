import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

const COLUMNS = [
    {
        label: 'Claim ID',
        fieldName: 'claimLink',
        type: 'url',
        typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' }
    },
    { label: 'Claimant', fieldName: 'ClaimantName', type: 'text' },
    { label: 'Type', fieldName: 'Type__c', type: 'text' },
    { label: 'Status', fieldName: 'Status__c', type: 'text' },
    { label: 'Date of Injury', fieldName: 'Date_Of_Injury__c', type: 'date' },
    { label: 'Education Type', fieldName: 'Education_Type__c', type: 'text' },
    { label: 'Disability', fieldName: 'Disability__c', type: 'text' },
    { label: 'Housing Status', fieldName: 'Housing_Status__c', type: 'text' }
];