public without sharing class TrackClaimController {
  @AuraEnabled(cacheable=true)
  public static Claim__c getClaim(String claimId) {
    Claim__c claim = [
      SELECT
        Id,
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

  @AuraEnabled(cacheable=true)
  public static List<FileWrapper> getAttachments(Id recordId) {
    List<FileWrapper> attachments = new List<FileWrapper>();

    List<ContentDocumentLink> links = [
      SELECT ContentDocumentId
      FROM ContentDocumentLink
      WHERE LinkedEntityId = :recordId
    ];

    List<Id> contentDocumentIds = new List<Id>();
    for (ContentDocumentLink link : links) {
      contentDocumentIds.add(link.ContentDocumentId);
    }

    List<ContentVersion> versions = [
      SELECT Id, Title, ContentDocumentId, FileType
      FROM ContentVersion
      WHERE ContentDocumentId IN :contentDocumentIds
      ORDER BY CreatedDate DESC
    ];

    for (ContentVersion file : versions) {
      // String fileUrl = generatePublicFileLink(file.Id);
      String fileUrl =
        System.Url.getOrgDomainUrl().toExternalForm() +
        '/sfc/servlet.shepherd/version/download/' +
        file.Id;
      attachments.add(new FileWrapper(file.Title, file.FileType, fileUrl));
    }

    return attachments;
  }

  public class FileWrapper {
    @AuraEnabled
    public String title;
    @AuraEnabled
    public String fileType;
    @AuraEnabled
    public String fileUrl;

    public FileWrapper(String title, String fileType, String fileUrl) {
      this.title = title;
      this.fileType = fileType;
      this.fileUrl = fileUrl;
    }
  }
}
