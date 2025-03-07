public without sharing class RegistrationController {
  @AuraEnabled
  public static Map<String, Object> registerUser(
    String firstName,
    String lastName,
    String email,
    String password,
    String ssn,
    String phone,
    Date dateOfBirth,
    String militaryBranch,
    String veteranStatus,
    String dischargeType
  ) {
    Map<String, Object> response = new Map<String, Object>();
    try {
      // Create User record with a lookup to Claimant__c
      User newUser = new User(
        FirstName = firstName,
        LastName = lastName,
        Email = email,
        Username = email,
        Alias = firstName.substring(0, 2).toLowerCase(),
        CommunityNickname = firstName + ' ' + lastName,
        ProfileId = [SELECT Id FROM Profile WHERE Name = 'Claims User' LIMIT 1]
        .Id,
        TimeZoneSidKey = UserInfo.getTimeZone().getID(),
        LocaleSidKey = UserInfo.getLocale(),
        EmailEncodingKey = 'UTF-8',
        LanguageLocaleKey = UserInfo.getLocale(),
        IsActive = true
      );

      insert newUser;
      System.debug('User created with ID: ' + newUser.Id);

      // Create Claimant record
      Claimant__c newClaimant = new Claimant__c(
        First_Name__c = firstName,
        Last_Name__c = lastName,
        Email_Address__c = email,
        SSN__c = ssn,
        DateOfBirth__c = dateOfBirth,
        Phone__c = phone,
        Military_Branch__c = militaryBranch,
        Veteran_Status__c = veteranStatus,
        Discharge_Type__c = dischargeType,
        User__c = newUser.Id
      );

      insert newClaimant;
      System.debug('Claimant__c created with ID: ' + newClaimant.Id);

      // Set the password for the user
      System.setPassword(newUser.Id, password);

      update newUser;

      PageReference login = Site.login(newUser.Username, password, '/s');
      System.debug('User logged in successfully.');

      response.put('success', true);
      response.put('message', 'User registered successfully.');
      response.put('redirect', login.getUrl());
    } catch (Exception e) {
      response.put('success', false);
      response.put('message', e.getMessage());
    }

    return response;
  }
}
