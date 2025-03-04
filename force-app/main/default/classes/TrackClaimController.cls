/**
 * Type__c - Picklist
 * Income__c - Currency
 * Currently_Homeless__c - Checkbox
 * Date_Of_Injury__c - Date
 * Disability__c - Text Area
 * Education_Type__c - Text
 * Has_Attachment__c - Checkbox
 * Housing_Status__c - Picklist
 * Institution_Name__c - Text
 * Pension_Eligilbility__c - Picklist
 * Service_Branch__c - Picklist
 * Service_Entry_Date__c - Date
 * Service_Exit_Date__c - Date
 * Status__c - Picklist
 */
/**
 *         this.showFields = {
            disability: ['Healthcare Benefits', 'Pension', 'Disability Compensation'].includes(this.selectedType),
            dateOfInjury: ['Healthcare Benefits', 'Pension', 'Disability Compensation'].includes(this.selectedType),
            annualIncome: ['Healthcare Benefits', 'Housing Assistance', 'Pension', 'Education & Training', 'Disability Compensation'].includes(this.selectedType),
            currentlyHomeless: this.selectedType === 'Housing Assistance',
            housingStatus: this.selectedType === 'Housing Assistance',
            educationType: this.selectedType === 'Education & Training',
            institutionName: this.selectedType === 'Education & Training'
        };
 */
public without sharing class TrackClaimController {
  @AuraEnabled(cacheable=true)
  public static Claim__c getClaim(String claimId) {
    Claim__c claim = [
      SELECT
        Name,
        Type__c,
        Income__c,
        Currently_Homeless__c,
        Date_Of_Injury__c,
        Disability__c,
        Education_Type__c,
        Has_Attachment__c,
        Housing_Status__c,
        Institution_Name__c,
        Pension_Eligibility__c,
        Service_Branch__c,
        Service_Entry_Date__c,
        Service_Exit_Date__c,
        Status__c,
        Final_Decision__c
      FROM Claim__c
      WHERE Name = :claimId
      LIMIT 1
    ];

    return claim;
  }
}
