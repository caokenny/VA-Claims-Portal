public without sharing class ClaimController {
  @AuraEnabled(cacheable=true)
  public static List<String> getClaimTypes() {
    return new List<String>{
      'Disability Compensation',
      'Pension',
      'Healthcare Benefits',
      'Education & Training',
      'Housing Assistance'
    };
  }

  @AuraEnabled(cacheable=true)
  public static Id getOrCreateClaimantForUser(Id userId) {
    try {
      // Get the current user's first and last name
      User user = [SELECT Id FROM User WHERE Id = :userId LIMIT 1];

      // Try to find an existing claimant linked to this user
      Claimant__c claimant;
      try {
        claimant = [SELECT Id FROM Claimant__c WHERE User__c = :userId LIMIT 1];
      } catch (Exception e) {
        System.debug('Error fetching Claimant: ' + e.getMessage());
      }

      // If claimant does not exist, create one and associate it with the user
      if (claimant == null) {
        System.debug(
          'No existing claimant found for user: ' +
            userId +
            '. Creating new claimant.'
        );

        claimant = new Claimant__c(
          First_Name__c = user.FirstName,
          Last_Name__c = user.LastName,
          User__c = userId
        );

        insert claimant;
      }

      return claimant.Id;
    } catch (Exception e) {
      System.debug('Error in getOrCreateClaimantForUser: ' + e.getMessage());
      return null;
    }
  }

  @AuraEnabled(cacheable=false)
  public static Id createClaim(Claim__c newClaim) {
    String claimType = newClaim.Type__c;

    Map<String, Id> recordTypeMap = new Map<String, Id>{
      'Disability Compensation' => '0124U000000uzGLQAY',
      'Education & Training' => '0124U000000uzGMQAY',
      'Healthcare Benefits' => '0124U000000uzGNQAY',
      'Housing Assistance' => '0124U000000uzGOQAY',
      'Pension' => '0124U000000uzGPQAY'

      //sandbox
      //   'Disability Compensation' => '0128N000004lU4QQAU',
      //   'Education & Training' => '0128N000004lU4kQAE',
      //   'Healthcare Benefits' => '0128N000004lU4fQAE',
      //   'Housing Assistance' => '0128N000004lU4VQAU',
      //   'Pension' => '0128N000004lU4aQAE'
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
  public static void createContentDocumentLink(
    Id contentDocumentId,
    Id relatedRecordId
  ) {
    ContentDocumentLink link = new ContentDocumentLink();
    link.ContentDocumentId = contentDocumentId;
    link.LinkedEntityId = relatedRecordId;
    link.ShareType = 'V';
    link.Visibility = 'AllUsers';
    insert link;
  }

  @AuraEnabled(cacheable=true)
  public static List<Claim__c> getUserClaims(Id userId) {
    return [
      SELECT Id, Type__c, Status__c, CreatedDate
      FROM Claim__c
      WHERE Claimant__c IN (SELECT Id FROM Claimant__c WHERE User__c = :userId)
      ORDER BY CreatedDate DESC
      LIMIT 5
    ];
  }

  @AuraEnabled
  public static Id getRecordTypeId(String recordTypeName) {
    try {
      RecordType rt = [
        SELECT Id
        FROM RecordType
        WHERE DeveloperName = :recordTypeName AND SObjectType = 'Claim'
        LIMIT 1
      ];
      return rt.Id;
    } catch (Exception e) {
      System.debug('Error fetching RecordType: ' + e.getMessage());
      return null;
    }
  }
}
