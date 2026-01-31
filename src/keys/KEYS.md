
# RSA Key Pairs

```
openssl genrsa -out RS256.key 4096
openssl rsa -in RS256.key -pubout -outform PEM -out RS256.key.pub

openssl genrsa -out RS384.key 4096
openssl rsa -in RS384.key -pubout -outform PEM -out RS384.key.pub

openssl genrsa -out RS512.key 4096
openssl rsa -in RS512.key -pubout -outform PEM -out RS512.key.pub

openssl genrsa -out PS256.key 4096
openssl rsa -in PS256.key -pubout -outform PEM -out PS256.key.pub

openssl genrsa -out PS384.key 4096
openssl rsa -in PS384.key -pubout -outform PEM -out PS384.key.pub

openssl genrsa -out PS512.key 4096
openssl rsa -in PS512.key -pubout -outform PEM -out PS512.key.pub
```

# EC Key Pairs

```
openssl ecparam -name prime256v1 -genkey -noout -out private.prime256v1.key
openssl pkcs8 -topk8 -in private.prime256v1.key -out private.prime256v1.key.pkcs8 -nocrypt
openssl ec -in private.prime256v1.key.pkcs8 -pubout -out public.prime256v1.key.pub

openssl ecparam -name secp384r1 -genkey -noout -out private.secp384r1.key
openssl pkcs8 -topk8 -in private.secp384r1.key -out private.secp384r1.key.pkcs8 -nocrypt
openssl ec -in private.secp384r1.key.pkcs8 -pubout -out public.secp384r1.key.pub

openssl ecparam -name secp521r1 -genkey -noout -out private.secp521r1.key
openssl pkcs8 -topk8 -in private.secp521r1.key -out private.secp521r1.key.pkcs8 -nocrypt
openssl ec -in private.secp521r1.key.pkcs8 -pubout -out public.secp521r1.key.pub

```