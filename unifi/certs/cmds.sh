# CA
openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -keyout ca.key -out ca.crt

# Generating Certificate Signing Request
openssl req -newkey rsa:2048 -sha256 -keyout server.key -out server.csr -subj "/CN=example-domain.ui.com/O=UniFi/C=US" -passout pass:pass -addext "subjectAltName = DNS:example-domain.ui.com"

# Generate Server public key
openssl ca -config openssl.cnf -policy policy_anything -md sha256 -days 3650 -in server.csr -out server.crt -batch -cert ca.crt -keyfile ca.key

# Remove Password from server's private key
openssl rsa -in server.key -out server_nopass.key