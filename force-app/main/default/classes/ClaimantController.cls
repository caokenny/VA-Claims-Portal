public with sharing class ClaimantController {
  @AuraEnabled(cacheable=true)
  public static Claimant__c getLoggedInUser() {
    Id currentUserId = UserInfo.getUserId();

    Claimant__c claimant = [
      SELECT
        Id,
        Name,
        User__c,
        First_Name__c,
        Last_Name__c,
        Email_Address__c,
        Phone__c,
        DateOfBirth__c,
        Military_Branch__c,
        Veteran_Status__c,
        Discharge_Type__c
      FROM Claimant__c
      WHERE User__c = :currentUserId
      LIMIT 1
    ];

    return claimant;
  }

  @AuraEnabled
  public static void updateClaimant(Claimant__c updatedClaimant) {
    update updatedClaimant;
  }
}
