# decertifierAPI

Welcome to the first version of DeCertifier!

DeCertifier is a tool for certifying groups of documents of the same event, this allows to verify that each document takes part on this event and that none of them had been modified. How it works: it hashes every document, then creates a merkel tree and saves the merkel root in the Blockchain.
How to verify: Given a document and an eventId, you can verify that this document takes part on the event. As the merkel root is saved on the blockchain, you can check that the given document is part of the leaves used to create the merkle tree. This is validated by generating a merkle proof from the given leaf and then reconstruting the tree until the merkle root is found and then compared to the one stored in the smart contract.

## API requests:

### Certify

POST https://certifier.universalplastic.io/notarize
body: {
"eventId": String,
"bussinessId": String,
"documents": [String]
}

### Certify

POST https://certifier.universalplastic.io/validate
body: {
"eventId": String,
"document": String
}

## TEST

You can test it here: https://decertifier.retool.com/embedded/public/d92a6fa3-d5a6-4615-bb78-0016c45ee1e0

## Designs for the client:

![image](https://github.com/UniversalPlastic-io/decertifierAPI/assets/62480517/07d01108-a5a1-40b2-9ba5-98837e45b9a4)
