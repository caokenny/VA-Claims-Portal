public without sharing class ViewClaimController {
  @AuraEnabled(cacheable=true)
  public static List<Claim__c> getUserClaims() {
    Id userId = UserInfo.getUserId();
    return [
      SELECT
        Id,
        Name,
        Claimant__c,
        Claimant__r.First_Name__c,
        Claimant__r.Last_Name__c,
        Type__c,
        Status__c,
        Date_Of_Injury__c,
        Education_Type__c,
        Disability__c,
        Housing_Status__c
      FROM Claim__c
      WHERE CreatedById = :userId
      ORDER BY CreatedDate DESC
    ];
  }
}
