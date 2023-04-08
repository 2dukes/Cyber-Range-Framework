import sys
import hashlib
from Crypto.Cipher import AES

# Run with python2 : py -2 .\decrypt.py .\BusinessPapers.doc

def derive_key(key): # It should work as explained here: https://learn.microsoft.com/en-us/windows/win32/api/wincrypt/nf-wincrypt-cryptderivekey
    # SHA-1 hash algorithm used
    key_sha1 = hashlib.sha1(key).digest()
    
    b0 = ""
    for x in key_sha1:
        b0 += chr(ord(x) ^ 0x36)
    
    b1 = ""
    for x in key_sha1:
        b1 += chr(ord(x) ^ 0x5c)
    
    # pad remaining bytes with the appropriate value
    b0 += "\x36"*(64 - len(b0))
    b1 += "\x5c"*(64 - len(b1))
    
    b0_sha1 = hashlib.sha1(b0).digest()
    b1_sha1 = hashlib.sha1(b1).digest()
    
    return b0_sha1 + b1_sha1

unpad = lambda s: s[0:-ord(s[-1])] # remove pkcs5 padding

fname = sys.argv[1]
with open(fname, 'rb+') as f:
    encrypted_data = f.read()
    key = "thosefilesreallytiedthefoldertogether"
 
    # 256-bit key / 8 = 32 bytes
    aes_key = derive_key(key)[:32]
    iv_name = fname[fname.rfind('\\') + 1:]
    iv = hashlib.md5(iv_name.lower()).digest()
    decryptor = AES.new(aes_key, AES.MODE_CBC, iv)
    decrypted_data = unpad(decryptor.decrypt(encrypted_data))
    f.seek(0)
    f.write(decrypted_data)
    f.truncate(len(decrypted_data))