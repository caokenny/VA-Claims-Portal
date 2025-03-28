public with sharing class AppealSubmissionController {

    @AuraEnabled(cacheable=true)
    public static List<Claim__c> getDeniedClaims() {
        try {
            return [
                SELECT Id, Name 
                FROM Claim__c 
                WHERE Final_Decision__c = 'Denied' 
                AND OwnerId = :UserInfo.getUserId()
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching denied claims: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getReasonPicklistValues() {
        try {
            Schema.DescribeFieldResult fieldResult = Appeal__c.Reason__c.getDescribe();
            List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
            List<String> values = new List<String>();

            for (Schema.PicklistEntry entry : picklistValues) {
                values.add(entry.getLabel()); 
            }

            return values;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching reason picklist values: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Appeal__c submitAppeal(Appeal__c newAppeal) {
        try {
            if (String.isEmpty(newAppeal.Claim__c)) {
                throw new AuraHandledException('Claim selection is required.');
            }

            newAppeal.OwnerId = UserInfo.getUserId();
            newAppeal.Status__c = 'Received'; 
            newAppeal.Type__c = 'Supplemental Claims';

            insert newAppeal;

            return newAppeal;
        } catch (Exception e) {
            throw new AuraHandledException('Error submitting appeal: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void createContentDocumentLink(Id contentDocumentId, Id relatedRecordId) {
        try {
            ContentDocumentLink link = new ContentDocumentLink();
            link.ContentDocumentId = contentDocumentId;
            link.LinkedEntityId = relatedRecordId;
            link.ShareType = 'V'; // View access
            link.Visibility = 'AllUsers';
            insert link;
        } catch (Exception e) {
            throw new AuraHandledException('Error linking file: ' + e.getMessage());
        }
    }
}
