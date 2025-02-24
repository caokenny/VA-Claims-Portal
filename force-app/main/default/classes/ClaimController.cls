public with sharing class ClaimController {
    @AuraEnabled(cacheable=true)
    public static List<Claim__c> getUserClaims() {
        Id userId = UserInfo.getUserId();
        return [SELECT Name, Claimant__c, Type__c, Status__c, Date_Of_Injury__c
                FROM Claim__c 
                WHERE CreatedById = :userId
                ORDER BY CreatedDate DESC];
    }
}
