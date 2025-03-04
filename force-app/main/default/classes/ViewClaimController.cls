public with sharing class ViewClaimController {
    @AuraEnabled(cacheable=true)
    public static List<Claim__c> getUserClaims() {
        Id userId = UserInfo.getUserId();
        return [SELECT Id, Name, Claimant__c, Claimant__r.First_Name__c, Claimant__r.Last_Name__c, 
                       Type__c, Status__c, Date_Of_Injury__c, 
                       Education_Type__c, Disability__c, Housing_Status__c
                FROM Claim__c 
                WHERE CreatedById = :userId
                ORDER BY CreatedDate DESC];
    }
    
    @AuraEnabled(cacheable=true)
    public static Claim__c getMostRecentClaim() {
        Id userId = UserInfo.getUserId();
        return [SELECT Id, Name, Claimant__c, Claimant__r.First_Name__c, Claimant__r.Last_Name__c, 
                       Type__c, Status__c, Date_Of_Injury__c
                FROM Claim__c 
                WHERE CreatedById = :userId
                ORDER BY CreatedDate DESC
                LIMIT 1];
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, Integer> getClaimStatistics() {
        Id userId = UserInfo.getUserId();
        Map<String, Integer> statistics = new Map<String, Integer>{
            'totalClaims' => 0,
            'approved' => 0,
            'pending' => 0,
            'denied' => 0
        };

        // Fetch total claims
        Integer totalClaims = [SELECT COUNT() FROM Claim__c WHERE CreatedById = :userId];
        statistics.put('totalClaims', totalClaims);

        // Fetch claims grouped by status
        List<AggregateResult> statusCounts = [
            SELECT Status__c, COUNT(Id) total
            FROM Claim__c
            WHERE CreatedById = :userId
            GROUP BY Status__c
        ];

        // Iterate through results and assign to map
        for (AggregateResult ar : statusCounts) {
            String status = (String) ar.get('Status__c');
            Integer count = (Integer) ar.get('total'); // Corrected field reference

            if (status == 'Approved') {
                statistics.put('approved', count);
            } else if (status == 'Pending') {
                statistics.put('pending', count);
            } else if (status == 'Denied') {
                statistics.put('denied', count);
            }
        }

        return statistics;
    }
}
