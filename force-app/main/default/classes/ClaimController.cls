public with sharing class ClaimController {
    @AuraEnabled(cacheable=true)
    public static List<RecordType> getRecordTypes() {
        return [SELECT Id, Name FROM RecordType WHERE SObjectType = 'Claim__c'];
    }

    @AuraEnabled(cacheable=true)
    public static List<FieldMetadata> getFieldsForRecordType(Id recordTypeId) {
        List<FieldMetadata> fieldList = new List<FieldMetadata>();

        // Retrieve only fields available for this record type
        Schema.DescribeSObjectResult objDescribe = Schema.getGlobalDescribe().get('Claim__c').getDescribe();
        Map<String, Schema.SObjectField> fieldsMap = objDescribe.fields.getMap();
        
        for (Schema.SObjectField field : fieldsMap.values()) {
            Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
            if (fieldDescribe.isAccessible()) { // Only add fields user has access to
                fieldList.add(new FieldMetadata(fieldDescribe.getName(), fieldDescribe.getLabel(), fieldDescribe.getType().name()));
            }
        }
        return fieldList;
    }

    public class FieldMetadata {
        @AuraEnabled public String apiName;
        @AuraEnabled public String label;
        @AuraEnabled public String type;
        
        public FieldMetadata(String apiName, String label, String type) {
            this.apiName = apiName;
            this.label = label;
            this.type = type;
        }
    }

    @AuraEnabled
    public static Claim__c createClaim(Map<String, Object> claimData) {
        Claim__c newClaim = new Claim__c();
        
        for (String key : claimData.keySet()) {
            if (key != 'files') {
                newClaim.put(key, claimData.get(key));
            }
        }
        insert newClaim;

        // Handle file attachments
        if (claimData.containsKey('files') && ((List<String>) claimData.get('files')).size() > 0) {
            List<ContentVersion> attachments = new List<ContentVersion>();
            for (String fileId : (List<String>) claimData.get('files')) {
                ContentVersion attachment = new ContentVersion(
                    Title = 'Claim Attachment',
                    PathOnClient = fileId,
                    VersionData = (Blob) claimData.get('fileData'),
                    FirstPublishLocationId = newClaim.Id
                );
                attachments.add(attachment);
            }
            insert attachments;
        }
        return newClaim;
    }
}
