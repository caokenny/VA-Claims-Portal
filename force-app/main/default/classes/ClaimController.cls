public with sharing class ClaimController {
    @AuraEnabled(cacheable=true)
    public static List<String> getClaimTypes() {
        return new List<String>{'Disability Compensation', 'Pension', 'Healthcare Benefits', 'Education & Training', 'Housing Assistance'};
    }    

    @AuraEnabled
    public static Id getOrCreateClaimantForUser(Id userId) {
        // Try to fetch existing Claimant record
        Claimant__c claimant;
        try {
            claimant = [SELECT Id FROM Claimant__c WHERE User__c = :userId LIMIT 1];
        } catch (Exception e) {
            System.debug('Error fetching Claimant: ' + e.getMessage());
        }
    
        // If no Claimant found, create a new one
        if (claimant == null) {
            claimant = new Claimant__c(User__c = userId);
            insert claimant;
        }
    
        return claimant.Id;
    }

    @AuraEnabled
    public static Id createClaim(Claim__c newClaim) {
        System.debug('Creating claim with type: ' + newClaim.Type__c);
        System.debug('Claimant ID: ' + newClaim.Claimant__c);
        System.debug('Status: ' + newClaim.Status__c);
    
        if (newClaim.Type__c == null) {
            throw new AuraHandledException('Claim Type is required.');
        }
    
        insert newClaim;
        return newClaim.Id;
    }   
    
    @AuraEnabled
    public static void createContentDocumentLink(Id contentDocumentId, Id relatedRecordId) {
        ContentDocumentLink link = new ContentDocumentLink();
        link.ContentDocumentId = contentDocumentId;
        link.LinkedEntityId = relatedRecordId;
        link.ShareType = 'V'; // View access
        link.Visibility = 'AllUsers';
        insert link;
    }

    @AuraEnabled(cacheable=true)
    public static List<Claim__c> getUserClaims(Id userId) {
        return [SELECT Id, Type__c, Status__c, CreatedDate 
                FROM Claim__c 
                WHERE Claimant__c IN (SELECT Id FROM Claimant__c WHERE User__c = :userId)
                ORDER BY CreatedDate DESC 
                LIMIT 5];
    }
    
}
