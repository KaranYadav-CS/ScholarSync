const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config');

let blobServiceClient = null;
let containerClient = null;

// Initialize Azure Blob client if credentials exist and demoMode is false
if (!config.demoMode && config.azureBlob.accountName) {
  try {
    const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
    if (config.azureBlob.connectionString) {
      blobServiceClient = BlobServiceClient.fromConnectionString(config.azureBlob.connectionString);
    } else if (config.azureBlob.accessKey) {
      const sharedKeyCredential = new StorageSharedKeyCredential(
        config.azureBlob.accountName,
        config.azureBlob.accessKey
      );
      blobServiceClient = new BlobServiceClient(
        `https://${config.azureBlob.accountName}.blob.core.windows.net`,
        sharedKeyCredential
      );
    } else {
      const { DefaultAzureCredential } = require('@azure/identity');
      blobServiceClient = new BlobServiceClient(
        `https://${config.azureBlob.accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
      );
    }
    containerClient = blobServiceClient.getContainerClient(config.azureBlob.containerName);
  } catch (err) {
    console.warn('[Storage] Azure Blob initialization warning. Falling back to local demo storage:', err.message);
  }
}

// Ensure local upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

/**
 * Upload a document buffer to Azure Blob Storage or Local Demo Disk
 */
async function uploadDocument({ buffer, originalname, mimetype, size }) {
  const extension = path.extname(originalname).toLowerCase();
  const blobName = `${uuidv4()}${extension}`;

  if (containerClient) {
    // Azure Blob Storage Private Upload
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: mimetype,
      },
      metadata: {
        originalName: Buffer.from(originalname).toString('base64'),
      },
    });
    return {
      blobName,
      storageType: 'AZURE_BLOB',
      sizeBytes: size,
    };
  }

  // Local Demo Storage
  const filePath = path.join(config.uploadDir, blobName);
  await fs.promises.writeFile(filePath, buffer);

  return {
    blobName,
    storageType: 'LOCAL_DEMO',
    sizeBytes: size,
  };
}

/**
 * Retrieve document stream or buffer for authorized download
 */
async function getDocumentStream(blobName) {
  if (containerClient) {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadResponse = await blockBlobClient.download(0);
    return downloadResponse.readableStreamBody;
  }

  // Local fallback
  const filePath = path.join(config.uploadDir, blobName);
  if (!fs.existsSync(filePath)) {
    // If demo sample file, return dummy stream
    const dummyPath = path.join(config.uploadDir, 'sample-document.pdf');
    if (!fs.existsSync(dummyPath)) {
      await fs.promises.writeFile(dummyPath, Buffer.from('%PDF-1.4\n% ScholarSync Verified Demo Document\n%%EOF'));
    }
    return fs.createReadStream(dummyPath);
  }
  return fs.createReadStream(filePath);
}

module.exports = {
  uploadDocument,
  getDocumentStream,
};
