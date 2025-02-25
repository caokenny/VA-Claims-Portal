public with sharing class ViewClaimController {
    @AuraEnabled(cacheable=true)
    public static List<Claim__c> getUserClaims() {
        try {
            Id userId = UserInfo.getUserId();
            return [
                SELECT Name, Claimant__c, Type__c, Status__c, Date_Of_Injury__c, Has_Attachment__c
                FROM Claim__c 
                WHERE CreatedById = :userId
                ORDER BY CreatedDate DESC
            ];
        } catch (Exception e) {
            System.debug('Error retrieving claims: ' + e.getMessage());
            return new List<Claim__c>();
        }
    }
}