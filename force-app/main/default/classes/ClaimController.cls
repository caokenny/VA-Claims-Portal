public with sharing class ClaimController {
    @AuraEnabled
    public static Claim__c createClaim(Map<String, Object> claimData) {
        Claim__c newClaim = new Claim__c(
            Claimant__c = (String) claimData.get('Claimant__c'),
            Date_Of_Injury__c = Date.valueOf((String) claimData.get('Date_Of_Injury__c')),
            Type__c = (String) claimData.get('Type__c'),
            Disability__c = (String) claimData.get('Disability__c'),
            Housing_Status__c = (String) claimData.get('Housing_Status__c'),
            Currently_Homeless__c = (Boolean) claimData.get('Currently_Homeless__c'),
            Education_Type__c = (String) claimData.get('Education_Type__c'),
            Has_Attachment__c = (Boolean) claimData.get('Has_Attachment__c')
        );
        insert newClaim;
        return newClaim;
    }
}
