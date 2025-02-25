public with sharing class AppealSubmissionController {
    @AuraEnabled
    public static Appeal__c submitAppeal(Appeal__c newAppeal) {
        try {
            newAppeal.OwnerId = UserInfo.getUserId();
            
            insert newAppeal;
            
            return newAppeal;
        } catch (Exception e) {
            throw new AuraHandledException('Error submitting appeal: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static String uploadFile(String recordId, String fileName, Blob fileBody) {
        try {
            ContentVersion file = new ContentVersion();
            file.Title = fileName;
            file.PathOnClient = fileName;
            file.VersionData = fileBody;
            insert file;

            ContentDocumentLink link = new ContentDocumentLink();
            link.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :file.Id LIMIT 1].ContentDocumentId;
            link.LinkedEntityId = recordId;
            link.ShareType = 'V';
            insert link;

            return 'File uploaded successfully';
        } catch (Exception e) {
            throw new AuraHandledException('Error uploading file: ' + e.getMessage());
        }
    }
}
