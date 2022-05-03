const encoder = new TextEncoder();
const salt = [89,113,135,234,168,204,21,36,55,93,1,132,242,242,192,156];
const iv = [89,113,135,234,168,204,21,36,55,93,1,132];

export const generateKeyPairRSA = async()=> {
    let keyPair = await window.crypto.subtle.generateKey(
        {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    );
    return keyPair;
    var pub = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
    var priv = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
    return {"privateKey":priv, "publicKey":pub};
};

export const rsaEncrypt = async (message, publicKey) =>{
    let encodedMessage = encoder.encode(message);
    return await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        publicKey,
        encodedMessage
        );
};

export const rsaDecrypt = async (cipher, privateKey) =>{
    return await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      privateKey,
      cipher
    );
};

export const exportAESKeyString = async (key) =>{
    const exported =  await window.crypto.subtle.exportKey(
        "jwk",
        key
      );
    return JSON.stringify(exported);
};

export const importRSAKeyPublic = async (publicKeyRaw) =>{
    return await window.crypto.subtle.importKey("jwk", 
                                    publicKeyRaw,
                                    {
                                    name: "RSA-OAEP",
                                    modulusLength: 2048,
                                    publicExponent: new Uint8Array([1, 0, 1]),
                                    hash: "SHA-256"
                                },
                                true,
                                ["encrypt"]);
};

export const importRSAKeyPrivate = async (privateKey) =>{
    return await window.crypto.subtle.importKey("jwk",
                                    privateKey,
                                    {
                                    name: "RSA-OAEP",
                                    modulusLength: 2048,
                                    publicExponent: new Uint8Array([1, 0, 1]),
                                    hash: "SHA-256"
                                },
                                true,
                                ["decrypt"]);
};



export const generateAESKeyIV = async () => {
    const algoKeyGen = {
        name: 'AES-GCM',
        length: 256
      };

    const keyUsages = [
    'encrypt',
    'decrypt'
    ];

    var key = await window.crypto.subtle.generateKey(algoKeyGen, true, keyUsages);
    var iv = await window.crypto.getRandomValues(new Uint8Array(12));
    let res = {
        "iv":iv,
        "key":key
    };
    return res;
};


export const aesEncrypt = async (message, key, iv) =>{
    var algoEncrypt = {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      };
   return await window.crypto.subtle
                        .encrypt(algoEncrypt, key, stringToArrayBuffer(message));
};

export const aesDecrypt = async (message, key, iv) =>{
    var algoEncrypt = {
        name: 'AES-GCM',
        iv: iv
      };
   return await window.crypto.subtle
                        .decrypt(algoEncrypt, key, message);
};

export const extractKeyIVDataFromRawFile = async (fileRaw, privateKey) =>{
    let rawIV = fileRaw.slice(0, 12);
    let rawKey = fileRaw.slice(12, 268);

    var decryptedKeyExp = await rsaDecrypt(rawKey, privateKey);
    var k = JSON.parse(arrayBufferToString(decryptedKeyExp));
    var impKey = await importAESKey(k);
    var data = fileRaw.slice(268,fileRaw.length);
    return {"key":impKey, "IV":rawIV, "data":data};
};

export const importAESKey = async (rawKey) =>{
    return await window.crypto.subtle.importKey(
      "jwk",
      rawKey,
      "AES-GCM",
      true,
      ["encrypt", "decrypt"]
    );
};

export const bytesToArrayBuffer = (bytes) => {
    const bytesAsArrayBuffer = new ArrayBuffer(bytes.length);
    const bytesUint8 = new Uint8Array(bytesAsArrayBuffer);
    bytesUint8.set(bytes);
    return bytesAsArrayBuffer;
  }

export const unwrapRsaPrivate = async (keyToUnWrap, password) =>{
    var keyMaterial  = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        {name: "PBKDF2"},
        false,
        ["deriveBits", "deriveKey"]
      );
    const saltBuffer = bytesToArrayBuffer(salt);
    const ivB = bytesToArrayBuffer(iv);
    var unWrappingKey = await window.crypto.subtle.deriveKey(
        {
          "name": "PBKDF2",
          salt: saltBuffer,
          "iterations": 100000,
          "hash": "SHA-256"
        },
        keyMaterial,
        { "name": "AES-GCM", "length": 256},
        true,
        [ "wrapKey", "unwrapKey" ]
      );
    var unWrapped = await window.crypto.subtle.unwrapKey(
        "jwk",
        keyToUnWrap,
        unWrappingKey,
        {
            name: "AES-GCM",
            iv: ivB
        },
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["decrypt"]
      );
      return unWrapped;
};

export const wrapRsaPrivate = async (keyToWrap, password) =>{
    var keyMaterial  = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        {name: "PBKDF2"},
        false,
        ["deriveBits", "deriveKey"]
      );

    const saltBuffer = bytesToArrayBuffer(salt);
    const ivB = bytesToArrayBuffer(iv);
    var wrappingKey = await window.crypto.subtle.deriveKey(
        {
          "name": "PBKDF2",
          salt: saltBuffer,
          "iterations": 100000,
          "hash": "SHA-256"
        },
        keyMaterial,
        { "name": "AES-GCM", "length": 256},
        true,
        [ "wrapKey", "unwrapKey" ]
      );
    var wrapped = await window.crypto.subtle.wrapKey(
        "jwk",
        keyToWrap,
        wrappingKey,
        {
          name: "AES-GCM",
          iv: ivB
        }
      );
    return wrapped;
};



export const arrayBufferToString = (buffer) =>{
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)));
};

export const stringToArrayBuffer = (str) => {
    const buffer = new ArrayBuffer(str.length);
    const bufferInterface = new Uint8Array(buffer);
    Array.from(str)
      .forEach((_, index) => bufferInterface[index] = str.charCodeAt(index));
    return buffer;
};