[
    {
        "id": "043f1c22-c9ff-4112-86f8-8f8f1e6a2dca",
        "name": "APTrust",
        "description": "APTrust 2.2 default BagIt profile.",
        "acceptBagItVersion": [
            "0.97", "1.0"
        ],
        "acceptSerialization": [
            "application/tar"
        ],
        "allowFetchTxt": false,
        "allowMiscTopLevelFiles": true,
        "allowMiscDirectories": true,
        "tarDirMustMatchName": true,
        "bagItProfileInfo": {
            "bagItProfileIdentifier": "https://wiki.aptrust.org/APTrust_BagIt_Profile-2.2",
            "contactEmail": "support@aptrust.org",
            "contactName": "A. Diamond",
            "externalDescription": "BagIt profile for ingesting content into APTrust. Updated November 9, 2018.",
            "sourceOrganization": "aptrust.org",
            "version": "2.2"
        },
        "manifestsRequired": [
            "md5"
        ],
        "tags": [
            {
                "id": "39b8ac8a-8e3d-47c3-9cda-5edd0d4ad1fb",
                "tagFile": "bagit.txt",
                "tagName": "BagIt-Version",
                "required": true,
                "emptyOk": false,
                "values": [
                    "0.97", "1.0"
                ],
                "defaultValue": "0.97",
                "userValue": "",
                "isBuiltIn": true,
                "help": "Which version of the BagIt specification describes this bag's format?"
            },
            {
                "id": "2a914ea2-ee3b-4c53-96e1-4f93f641338b",
                "tagFile": "bagit.txt",
                "tagName": "Tag-File-Character-Encoding",
                "required": true,
                "emptyOk": false,
                "values": [
                    "UTF-8"
                ],
                "defaultValue": "UTF-8",
                "userValue": "",
                "isBuiltIn": true,
                "help": "How are this bag's plain-text tag files encoded? (Hint: usually UTF-8)"
            },
            {
                "id": "567451b6-1f30-4bda-b66b-9a657426d5e5",
                "tagFile": "bag-info.txt",
                "tagName": "Source-Organization",
                "required": true,
                "emptyOk": false,
                "values": [],
                "defaultValue": null,
                "userValue": "",
                "isBuiltIn": true,
                "help": "The name of the organization that produced this bag, or is responsible for its contents."
            },
            {
                "id": "117e46d8-096f-41f1-8c94-7d9202b9477b",
                "tagFile": "bag-info.txt",
                "tagName": "Bag-Count",
                "required": false,
                "emptyOk": true,
                "values": [],
                "defaultValue": null,
                "userValue": "",
                "isBuiltIn": true,
                "help": "The number of bags that make up this object. Set this only if you are packaging a single object into multiple bags. See https://wiki.aptrust.org/Bagging_specifications for info on naming multi-part APTrust bags."
            },
            {
                "id": "41b75504-e54d-49a1-aad4-c8a4921d15ce",
                "tagFile": "bag-info.txt",
                "tagName": "Bagging-Date",
                "required": false,
                "emptyOk": true,
                "values": [],
                "defaultValue": null,
                "userValue": "",
                "isBuiltIn": true,
                "help": "The date this bag was created. The bagging software should set this automatically."
            },
            {
                "id": "4d9e682c-4236-4adf-aaf2-c9d7666e3062",
                "tagFile": "bag-info.txt",
                "tagName": "Bagging-Software",
                "required": false,
                "emptyOk": true,
                "values": [],
                "defaultValue": null,
                "userValue": "",
                "isBuiltIn": true,
                "help": "The name of the software that created this bag. The bagging software should set this automatically."
            },
            {
                "id": "32e69005-4495-452f-8b3d-bef545fca583",
                "tagFile": "bag-info.txt",
                "tagName": "Bag-Group-Identifier",
                "required": false,
                "emptyOk": true,
                "values": [],
                "defaultValue": null,
                "userValue": "",
                "isBuiltIn": true,
                "help": "Identifies the logical group or collection to which a bag belongs. Several bags may share the same Bag-Group-Identifier to indicate that they are part of the same logical grouping."
            },
            {
                "id": "917fc560-5bd1-4a5b-acb6-b7a4ce749252",
                "tagFile": "bag-info.txt",
                "tagName": "Internal-Sender-Description",
                "required": false,
                "emptyOk": true,
                "values": [],
                "defaultValue": null,
                "userValue": "",
                "isBuiltIn": true,
                "help": "A description of the bag's contents for the sender's internal use. This description will appear in the APTrust registry if you do not set the Description tag in the aptrust-info.txt file."
            },
            {
                "id": "018c0706-5597-4406-a705-205c608d827f",
                "tagFile": "bag-info.txt",
                "tagName": "Internal-Sender-Identifier",
                "required": false,
                "emptyOk": true,
                "values": [],
                "defaultValue": null,
                "userValue": "",
                "isBuiltIn": true,
                "help": "A unique identifier for this bag inside your organization."
            },
            {
                "id": "de2c8f3e-fadb-4811-88a2-83aafa44fb50",
                "tagFile": "bag-info.txt",
                "tagName": "Payload-Oxum",
                "required": false,
                "emptyOk": true,
                "values": [],
                "defaultValue": null,
                "userValue": "",
                "isBuiltIn": true,
                "help": "The number of files and bytes in this bag's payload. This should be calculated and set by the bagging software."
            },
            {
                "id": "9b7344ae-9d06-4444-9d8a-dda7e5c2b8dc",
                "tagFile": "aptrust-info.txt",
                "tagName": "Title",
                "required": true,
                "emptyOk": false,
                "values": [],
                "defaultValue": null,
                "userValue": "",
                "isBuiltIn": true,
                "help": "The title or name of that describes this bag's contents."
            },
            {
                "id": "60ef466a-6d9c-4825-92cf-e472fb05f3d4",
                "tagFile": "aptrust-info.txt",
                "tagName": "Access",
                "required": true,
                "emptyOk": false,
                "values": [
                    "Consortia",
                    "Institution",
                    "Restricted"
                ],
                "defaultValue": null,
                "userValue": "",
                "isBuiltIn": true,
                "help": "Access rights for this bag describe who can see that it exists in the repository."
            },
            {
                "id": "d94d1d47-49cb-4569-8d27-d9ebbf25c9b2",
                "tagFile": "aptrust-info.txt",
                "tagName": "Description",
                "required": false,
                "emptyOk": true,
                "values": [],
                "defaultValue": null,
                "userValue": "",
                "isBuiltIn": true,
                "help": "The description of the bag that you want to appear in the APTrust registry."
            },
            {
                "id": "53075007-e6cf-4a18-9b34-caa605ed593f",
                "tagFile": "aptrust-info.txt",
                "tagName": "Storage-Option",
                "required": true,
                "emptyOk": false,
                "values": [
                    "Standard",
                    "Glacier-OH",
                    "Glacier-OR",
                    "Glacier-VA",
                    "Glacier-Deep-OH",
                    "Glacier-Deep-OR",
                    "Glacier-Deep-VA"
                ],
                "defaultValue": "Standard",
                "userValue": "",
                "isBuiltIn": true,
                "help": "How do you want this bag to be stored in APTrust? Standard = S3/Virginia + Glacier/Oregon. Glacier-OH = Glacier-only storage in Ohio. Glacier-OR = Glacier-only storage in Oregon. Glacier-VA = Glacier-only storage in Virginia. Standard storage includes regular 90-day fixity checks. Glacier-only storage is less expensive but excludes fixity checks. File in Glacier-only storage may take up to 24 hours longer to restore and excessive Glacier retrieval may incur additional fees."
            }
        ],
        "serialization": "required",
        "tagManifestsRequired": [],
        "baseProfileId": "",
        "isBuiltIn": true
    }
]
