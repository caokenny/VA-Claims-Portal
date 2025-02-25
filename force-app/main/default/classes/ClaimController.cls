public with sharing class ClaimController {
    @AuraEnabled(cacheable=true)
    public static List<String> getClaimTypes() {
        List<String> claimTypes = new List<String>{'Healthcare', 'Housing', 'Pension', 'Education', 'Disability'};
        return claimTypes;
    }

    @AuraEnabled
    public static Id createClaim(Claim__c newClaim) {
        insert newClaim;
        return newClaim.Id;
    }
}
