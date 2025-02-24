public without sharing class RegistrationController {
  @AuraEnabled(cacheable=false)
  public static String registerUser(
    String firstName,
    String lastName,
    String email,
    String phone,
    Date dateOfBirth,
    String militaryBranch,
    String veteranStatus /*, String dischargeType*/
  ) {
    try {
      // Create User record with a lookup to Claimant__c
      User newUser = new User(
        Email = email,
        Username = email,
        LastName = lastName,
        FirstName = firstName,
        Alias = firstName.substring(0, 2).toLowerCase(),
        ProfileId = [SELECT Id FROM Profile WHERE Name = 'Claims User' LIMIT 1]
        .Id,
        TimeZoneSidKey = 'America/New_York',
        LocaleSidKey = 'en_US',
        EmailEncodingKey = 'UTF-8',
        LanguageLocaleKey = 'en_US'
      );

      insert newUser;

      // Create Claimant record
      Claimant__c newClaimant = new Claimant__c(
        First_Name__c = firstName,
        Last_Name__c = lastName,
        Email_Address__c = email,
        DateOfBirth__c = dateOfBirth,
        Phone__c = phone,
        Military_Branch__c = militaryBranch,
        Veteran_Status__c = veteranStatus,
        //Discharge_Type__c = dischargeType,
        User__c = newUser.Id
      );

      insert newClaimant;

      // Set the password for the user
      // System.setPassword(newUser.Id, password);

      return 'Success';
    } catch (Exception e) {
      return 'Error: ' + e.getMessage();
    }
  }
}
