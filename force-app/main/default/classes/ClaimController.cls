public with sharing class ClaimController {
    @AuraEnabled(cacheable=true)
    public static List<String> getClaimTypes() {
        return new List<String>{'Disability Compensation', 'Pension', 'Healthcare Benefits', 'Education & Training', 'Housing Assistance'};
    }    

    @AuraEnabled
    public static Id getOrCreateClaimantForUser(Id userId) {
        
        Claimant__c claimant;
        try {
            claimant = [SELECT Id FROM Claimant__c WHERE User__c = :userId LIMIT 1];
        } catch (Exception e) {
            System.debug('Error fetching Claimant: ' + e.getMessage());
        }
    
        if (claimant == null) {
            claimant = new Claimant__c(User__c = userId);
            insert claimant;
        }
    
        return claimant.Id;
    }

    @AuraEnabled
    public static Id createClaim(Claim__c newClaim) {
        
        String claimType = newClaim.Type__c;

        
        Map<String, Id> recordTypeMap = new Map<String, Id>{
            'Disability Compensation' => '0124U000000uzGLQAY',
            'Education & Training' => '0124U000000uzGMQAY',
            'Healthcare Benefits' => '0124U000000uzGNQAY',
            'Housing Assistance' => '0124U000000uzGOQAY',
            'Pension' => '0124U000000uzGPQAY'
        };

        
        Id recordTypeId = recordTypeMap.get(claimType);

        if (recordTypeId == null) {
            System.debug('Invalid Claim Type: ' + claimType);
           
            return null;
        }

        
        newClaim.RecordTypeId = recordTypeId;

       
        insert newClaim;

        return newClaim.Id;
    }

    @AuraEnabled
    public static void createContentDocumentLink(Id contentDocumentId, Id relatedRecordId) {
        ContentDocumentLink link = new ContentDocumentLink();
        link.ContentDocumentId = contentDocumentId;
        link.LinkedEntityId = relatedRecordId;
        link.ShareType = 'V';
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

    @AuraEnabled
    public static Id getRecordTypeId(String recordTypeName) {
        try {
            RecordType rt = [SELECT Id FROM RecordType WHERE DeveloperName = :recordTypeName AND SObjectType = 'Claim' LIMIT 1];
            return rt.Id;
        } catch (Exception e) {
            System.debug('Error fetching RecordType: ' + e.getMessage());
            return null;
        }
    }
    
}
